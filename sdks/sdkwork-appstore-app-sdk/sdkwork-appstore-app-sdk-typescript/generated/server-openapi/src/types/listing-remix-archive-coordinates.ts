/** Source archive coordinates. The client fetches the bytes through the Drive app API (nodes download URLs or download grants) and verifies the SHA-256 before unpacking. */
export interface ListingRemixArchiveCoordinates {
  /** Deploy artifact identity the archive was uploaded as. */
  artifactId: string;
  /** Drive node that holds the archive bytes. */
  driveNodeId: string;
  /** Original archive file name, including its extension. */
  fileName: string;
  /** Archive size in bytes, as a decimal string. */
  contentLength?: string;
  /** Published SHA-256 digest (hex) of the archive, when deploy recorded one. The client must refuse to unpack bytes that do not match. */
  checksumSha256?: string;
}
