import { BuildOptions, download, createLambda, shouldServe } from '@vercel/build-utils';

export const version = 3;

export { shouldServe };

export async function build({
	workPath,
	files,
	entrypoint,
	meta = {},
	config = {}
}: BuildOptions) {

  // Build the code here…

  const lambda = createLambda({
    files: {
      ...downloadedFiles,
      ...cacheFiles,
      ...bootFiles,
      ...hsFiles
    },
    handler: entrypoint,
    runtime: "hs1.x"
  });
  return {
    output: lambda
  };
}