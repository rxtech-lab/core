import { ErrorCode } from "../errorCode";
import { CustomError } from "./error";

/**
 * This error is not a real error,
 * but a signal to the client that the client should redirect to a new location.
 *
 * @example
 * try {
 *     // some code
 * } catch (error) {
 *    if (error instanceof RedirectError) {
 *     // redirect to new location
 *     }
 *     // handle other errors
 *  }
 */
export class RedirectError extends CustomError {
  readonly newLocation: string;

  constructor(newLocation: string) {
    super(
      `Redirect to new location: ${newLocation}`,
      ErrorCode.RedirectToNewLocation,
    );

    this.newLocation = newLocation;
  }
}
