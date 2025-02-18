import { HISTORY_KEY, ROUTE_KEY, STATE_KEY, Storage } from "@rx-lab/storage";

import * as fs from "node:fs";
import { Route, StoredRoute } from "@rx-lab/common";

interface State {
  data: any;
}

type StoredState = { [key: string]: State };

const OUTPUT_FILE_NAME = "state.json";

export class FileStorage extends Storage {
  private checkIfFileExists(filename: string): Promise<boolean> {
    return new Promise((resolve) =>
      fs.access(filename, fs.constants.F_OK, (err) => {
        resolve(!err);
      }),
    );
  }

  private createFile(filename: string, initialContent: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, initialContent, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async createFileIfNotExists(
    filename: string,
    initialContent: any,
  ): Promise<void> {
    const exists = await this.checkIfFileExists(filename);
    if (!exists) {
      await this.createFile(filename, JSON.stringify(initialContent));
    }
  }

  private async readState(): Promise<StoredState> {
    await this.createFileIfNotExists(OUTPUT_FILE_NAME, {});

    return new Promise((resolve, reject) => {
      fs.readFile(OUTPUT_FILE_NAME, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }

  private writeState(state: StoredState): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile("state.json", JSON.stringify(state), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async restoreState<T>(key: string): Promise<T | undefined> {
    const state = await this.readState();
    return state[`${STATE_KEY}-${key}`]?.data;
  }

  async saveState<T>(key: string, route: Route, state: T): Promise<void> {
    const storedState = await this.readState();
    storedState[`${STATE_KEY}-${key}`] = {
      data: state,
    };
    await this.writeState(storedState);
    const listener = this.stateChangeListeners.get(`${STATE_KEY}-${key}`);
    listener?.();
  }

  async restoreRoute(key: string): Promise<StoredRoute | undefined> {
    const state = await this.readState();
    const stateKey = `${ROUTE_KEY}-${key}`;
    return state[stateKey]?.data;
  }

  async saveRoute(key: string, path: StoredRoute): Promise<void> {
    const storedState = await this.readState();
    storedState[`${ROUTE_KEY}-${key}`] = {
      data: path,
    };
    await this.writeState(storedState);
    const listener = this.routeChangeListeners.get(`${ROUTE_KEY}-${key}`);
    listener?.();
  }

  async deleteState(key: string, route: StoredRoute): Promise<void> {
    const state = await this.readState();
    delete state[`${STATE_KEY}-${key}`];
    await this.writeState(state);
    const listener = this.stateChangeListeners.get(`${STATE_KEY}-${key}`);
    listener?.();
  }

  async addHistory(key: string, route: StoredRoute): Promise<void> {
    const storedKey = `${HISTORY_KEY}-${key}`;
    const storedState = await this.readState();
    storedState[storedKey] = {
      data: route,
    };
    await this.writeState(storedState);
  }

  async deleteHistory(key: string): Promise<void> {
    const storedKey = `${HISTORY_KEY}-${key}`;
    const storedState = await this.readState();
    delete storedState[storedKey];
    await this.writeState(storedState);
  }

  async restoreHistory(key: string): Promise<StoredRoute | undefined> {
    const storedKey = `${HISTORY_KEY}-${key}`;
    const storedState = await this.readState();
    return storedState[storedKey]?.data;
  }
}
