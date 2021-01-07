import { BuildOptions, download, createLambda, shouldServe, Files, FileFsRef } from '@vercel/build-utils';
import { join, dirname } from 'path';
import execa from 'execa';

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
  /*

    run: stack new my-project
    The stack new command should have created the following files:

    ├── .stack/
    ├── app
    │   └── Main.hs
    ├── ChangeLog.md
    ├── LICENSE
    ├── my-project.cabal
    ├── package.yaml
    ├── README.md
    ├── Setup.hs
    ├── src
    │   └── Lib.hs
    ├── stack.yaml
    └── test
        └── Spec.hs

    3 directories, 10 files
  */

    console.log('installing haskell stack tool');

    await installStack();

    console.log("downloading source files");

    const downloadedFiles = await download(files, workPath, meta);

    const entrypointPath = downloadedFiles[entrypoint].fsPath;
	  const entrypointDirname = dirname(entrypointPath);

    console.log("downloading stack files");

    const stackFiles = await getStackFiles(workPath, entrypointDirname);

    const lambda = createLambda({
        files: {
        ...downloadedFiles,
        ...stackFiles
        },
        handler: entrypoint,
        runtime: "provided"
    });
    return {
        output: lambda
    };
}

async function installStack() {
  try {
    await execa.command('curl -sSL https://get.haskellstack.org/ | sh', { shell: true });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

async function getStackFiles(workPath: string, entrypointDirname: string): Promise<Files> {


  await execa.command('stack build', { cwd: entrypointDirname, stdio: "inherit" });
  const hsPath = join(workPath, '.stack-work');

  return {
		".stack-work": new FileFsRef({
			mode: 0o755,
			fsPath: hsPath,
		})
	};
}