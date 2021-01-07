import { BuildOptions, download, createLambda, shouldServe, Files, FileFsRef } from '@vercel/build-utils';
import { join } from 'path';
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

    console.log("downloading source files");

    const downloadedFiles = await download(files, workPath, meta);

    const hsFiles = await getStackFiles(workPath);

    const lambda = createLambda({
        files: {
        ...downloadedFiles,
        ...hsFiles
        },
        handler: entrypoint,
        runtime: "hs1.x"
    });
    return {
        output: lambda
    };
}

async function getStackFiles(workPath: string): Promise<Files> {

    const DOWNLOAD_URL = 'https://get.haskellstack.org/'
    const hsbinDir = join(workPath, '.stack-work');
    let hsPath = '';

    try {
		await execa.command('curl -sSL https://get.haskellstack.org/ | sh', { shell: true });

		hsPath = join(hsbinDir, 'deno');
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}

    return {
		".stack-work": new FileFsRef({
			mode: 0o755,
			fsPath: hsPath,
		})
	};
}