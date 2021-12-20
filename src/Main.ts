import { execSync } from 'child_process';
import { exit } from 'process';

function tryCatchFinally({
    tryFunc,
    tryParams,
    catchFunc,
    catchParams,
    finallyFunc,
    finallyParams,
}:any){
    var tryReturn:any;
    var catchReturn:any;
    var finallyReturn:any;

    try{
        tryReturn = tryFunc(tryParams);
    } catch(e){
        console.error(e);
        catchReturn = catchFunc(catchParams);
    } finally{
        finallyReturn = finallyFunc(finallyParams);
    }
    return {
        tryReturn,
        catchReturn,
        finallyReturn
    };
}

function mkdir(path: string) {
    execSync(`mkdir -p ${path}`).toString();
}

function rm(path: string) {
    execSync(`rm -rf ${path}`).toString();
}

function symbolicLink({
    target,
    link
}:any){
    return execSync(`ln -sf ${target} ${link}`).toString();
}

const wineDefaultPrefixPath: string = '~/.wine';
const steamAppsPath: string = '~/.local/share/Steam/steamapps/';
const findAppManifestsCommand: string = `find ${steamAppsPath} -name 'appmanifest_*.acf' -exec echo {} \\\;`;
const appManifestPaths: string[] = execSync(findAppManifestsCommand).toString().split('\n');
const result:any = appManifestPaths.map((appManifestPath: string) => {
    const fileName: string = (function (p: string): string {
        return p.substring(p.lastIndexOf('/'), p.length);
    })(appManifestPath);
    const directoryPath: string = (function (p: string): string {
        return p.substring(0, p.lastIndexOf('/'));
    })(appManifestPath);
    const steamAppId: string = (function (p: string): string {
        return p.substring(p.lastIndexOf('_') + 1, p.lastIndexOf('.'));
    })(fileName);
    const compatdataPfxPath: string = (function (d: string, a: string): string {
        return `${d}/compatdata/${a}/pfx`;
    })(directoryPath, steamAppId);
    const res =  tryCatchFinally({
        tryFunc:mkdir,
        tryParams:compatdataPfxPath,
        finallyFunc:tryCatchFinally,
        finallyParams:{
            tryFunc:rm,
            tryParams:compatdataPfxPath,
            finallyFunc:symbolicLink,
            finallyParams:{
                target:wineDefaultPrefixPath,
                link:compatdataPfxPath
            }
        },
    })
    return res;
});
console.log(result);