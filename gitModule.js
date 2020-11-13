import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'
        // Initialize isomorphic-git with a file system
        const fs = new LightningFS('fs', { wipe: true });
        //git.plugins.set('fs', window.fs);
        //window.pfs = window.fs.promises;
        async function cloneRepo() {
            /*try {
                await pfs.mkdir(dir)
            } catch(e) {
                console.error(e);
                return;
            }
            //await pfs.readdir(dir);*/
            await git.clone({
                fs,
                http,
                dir:"/cloned",
                corsProxy: 'https://cors.isomorphic-git.org',
                url: 'https://github.com/dadukhin/dadukhin.github.io.git',
                ref: 'master',
                singleBranch: true,
            });
            //await pfs.readdir(dir);
            
            /*let response = await fetch("https://dadukhin.github.io" + "/memory?version=" + new Date().getTime());
            response = await response.text();
            document.getElementById('memory').innerHTML = response;
            */
        }
        export async function testCommit () {
            
            //let g = await git.log({dir});
            await cloneRepo();
            /*let prevMemory = await pfs.readFile(`${dir}/memory`, {
                encoding: "utf8"
            });
            console.log(prevMemory);
            */
            //let curContent = new XMLSerializer().serializeToString(document);
           let header = '<html xmlns="http://www.w3.org/1999/xhtml" contenteditable="true">' 
           
           document.getElementById("sc1").remove();
           document.getElementById("sc2").remove();
           let curContent = header + document.getElementsByTagName('html')[0].innerHTML;

            //await pfs.writeFile(`${dir}/memory`, prevMemory + new Date().toLocaleDateString()+"\n", 'utf8');
            //await git.add({ dir, filepath: 'memory' });

            await fs.promises.writeFile('/cloned/memory', curContent, 'utf8');
            await git.add({ fs, dir:"/cloned", filepath: 'memory' });

            let sha = await git.commit({
                fs,
                dir:"/cloned",
                message: 'auto commit msg',
                author: {
                    name: 'dadukhin',
                    email: 'shrek@yahoo.com'
                }
            });
            let user = "dadukhin";
            let pass = document.getElementById('oeuf').value;
            let res = await git.push({
                fs,
                http,
                onAuth: () => ({
                    username: user,
                    password: pass,
                }),
                dir: "/cloned",
                remote: 'origin',
                ref: 'master'
});
            console.log(JSON.stringify(res));

        }
