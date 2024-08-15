import { RouteMetadata } from "@rx-lab/common";
import { Command, CommandButton } from "@rx-lab/core";
import React from "react";

export const metadata: RouteMetadata = {
  title: "Subpage",
  description: "This is a subpage",
  includeInMenu: true,
};

export default function Page() {
  return (
    <div>
      <h1>Home page: Check other pages</h1>
      <p>
        Nested: <Command>/home/nested</Command>
      </p>
      <hr />
      <span>
        Check this link:
        <a href={"https://google.com"}>Google.com</a>
      </span>
      <menu>
        <CommandButton command={"/home_nested"}>
          Replace and home nested
        </CommandButton>
        <CommandButton renderNewMessage={true} command={"/home_nested?data=1"}>
          New and home nested
        </CommandButton>
      </menu>
    </div>
  );
}
