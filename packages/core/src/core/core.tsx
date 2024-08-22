import path from "path";
import {
  APP_FOLDER,
  type AdapterInterface,
  BaseChatroomInfo,
  BaseMessage,
  type Container,
  CoreApi,
  CoreInterface,
  PageProps,
  ROUTE_METADATA_FILE,
  RedirectOptions,
  RenderedComponent,
  StorageInterface,
} from "@rx-lab/common";
import React from "react";
import { Compiler } from "../compiler";
import { Renderer } from "./renderer";
import { renderServerComponent } from "./server/renderServerComponent";
import { createEmptyFiberRoot } from "./utils";
import { WrappedElement } from "./wrappedElement";

type CompileOptions =
  | {
      rootDir: string;
      destinationDir: string;
    }
  | {
      adapter: AdapterInterface<any, any, any>;
      storage: StorageInterface;
      rootDir: string;
      destinationDir: string;
    };

type StartOptions = {
  outputDir: string;
};

/**
 * Debounce timeout for commit updates.
 */
const DEFAULT_TIMEOUT = 2_000; // 2 seconds

interface CoreOptions {
  adapter: AdapterInterface<any, any, any>;
  storage: StorageInterface;
}

export class Core<T extends Container<BaseChatroomInfo, BaseMessage>>
  extends Renderer<T>
  implements CoreInterface<any>
{
  private element: RenderedComponent | undefined;

  constructor({ adapter, storage }: CoreOptions) {
    super({ adapter, storage });
  }

  static async Compile(opts: CompileOptions) {
    let adapter: AdapterInterface<any, any, any>;
    let storage: StorageInterface;

    const compiler = new Compiler({
      rootDir: opts.rootDir,
      destinationDir: opts.destinationDir,
    });
    const routeInfo = await compiler.compile();

    if ("adapter" in opts && "storage" in opts) {
      adapter = opts.adapter;
      storage = opts.storage;
    } else {
      const adapterFile = await require(
        path.join(opts.destinationDir, APP_FOLDER, "adapter"),
      );
      adapter = adapterFile.adapter;
      storage = adapterFile.storage;
    }

    const core = new Core({
      adapter: adapter,
      storage: storage,
    });

    await core.router.initFromRoutes(routeInfo);
    await core.init();
    return core;
  }

  static async Start(opts: StartOptions) {
    const adapterFile = await require(
      path.join(opts.outputDir, APP_FOLDER, "adapter"),
    );
    const adapter = adapterFile.adapter;
    const storage = adapterFile.storage;

    const core = new Core({
      adapter: adapter,
      storage: storage,
    });

    await core.router.init(path.join(opts.outputDir, ROUTE_METADATA_FILE));
    await core.init();
    return core;
  }

  /**
   * The core API that provides the necessary methods to render the app.
   */
  private get coreApi(): CoreApi<T> {
    return {
      renderApp: (container, callback) => {
        this.listeners.set(this.adapter, callback);
        return this.render(container);
      },
      restoreRoute: async (key) => {
        return await this.router.getRouteFromKey(key);
      },
      redirectTo: async (container, path, options) => {
        await this.redirect(container, path, options);
        return container;
      },
    };
  }

  /**
   * Initialize the renderer.
   */
  async init() {
    // initialize the adapter
    await this.adapter.init(this.coreApi);
    this.adapter.subscribeToMessageChanged(async (container, message) => {
      try {
        await this.redirect(container, message, {
          shouldRender: true,
          shouldAddToHistory: true,
        });
      } catch (e) {
        console.error(e);
      }
    });
    await this.loadAndRenderStoredRoute("/");
  }

  async handleMessageUpdate(message: BaseMessage) {
    await this.adapter.handleMessageUpdate(message);
    this.lastCommitUpdateTime = Date.now();
    return new Promise<void>((resolve) => {
      const checkCommitUpdates = () => {
        const currentTime = Date.now();
        if (currentTime - this.lastCommitUpdateTime >= DEFAULT_TIMEOUT) {
          resolve();
        } else {
          setTimeout(checkCommitUpdates, 100); // Check every 100ms
        }
      };

      this.handleMessageUpdateResolver = resolve;
      checkCommitUpdates();
    });
  }

  async redirect(container: T, routeOrObject: any, options?: RedirectOptions) {
    const key = this.adapter.getRouteKey(container);
    const route = await this.adapter.decodeRoute(routeOrObject);
    if (route) {
      await this.router.navigateTo(key, route);
      if (options?.shouldAddToHistory) {
        await this.storage.addHistory(key, route);
      }
      delete container.message.text;
    }

    if (options?.shouldRender) {
      await this.loadAndRenderStoredRoute(key);
      await this.render(container);
    }
  }

  async loadAndRenderStoredRoute(key: string) {
    const component = await this.router.render(key);
    await this.setComponent(component);
    return component;
  }

  /**
   * Set the component to render.
   * @param component Must be a valid client component.
   */
  private async setComponent(component: RenderedComponent) {
    this.element = component;
  }

  /**
   * Helper function to render the app asynchronously.
   * @param container The container to render the app in
   * @private
   */
  async render(container: T) {
    if (!this.element) {
      throw new Error("No component to render");
    }

    if (!container._rootContainer) {
      createEmptyFiberRoot(container, this.reconciler);
    }

    // wrap the element with the router and storage providers so that
    // the components can access the router and storage
    const Component = this.element.component;

    const pageProps: PageProps = {
      searchQuery: this.element.queryString,
      params: this.element.params,
      text: container.message.text,
    };

    const wrappedElement = React.createElement(
      WrappedElement,
      {
        element: this.element,
        storage: this.storage,
        chatroomInfo: container.chatroomInfo,
        message: container.message,
        api: this.coreApi,
      },
      await renderServerComponent(Component, pageProps),
    );

    this.lastCommitUpdateTime = Date.now();

    await new Promise<void>((resolve) => {
      this.reconciler.updateContainer(
        wrappedElement,
        container._rootContainer,
        null,
        async () => {
          await this.adapter.componentOnMount(container);
          resolve();
        },
      );
    });

    return container;
  }

  async onDestroy() {
    await this.adapter.onDestroy();
    this.listeners.clear();
  }
}
