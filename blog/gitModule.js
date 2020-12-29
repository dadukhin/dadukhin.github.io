import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'
        const fs = new LightningFS('fs', { wipe: true });
        async function cloneRepo() {
            await git.clone({
                fs,
                http,
                dir:"/cloned",
                corsProxy: 'https://cors.isomorphic-git.org',
                url: 'https://github.com/dadukhin/dadukhin.github.io.git',
                ref: 'master',
                singleBranch: true,
            });
        }
        export async function testCommit () {
            
         await cloneRepo();
           let header = '<html xmlns="http://www.w3.org/1999/xhtml" contenteditable="true">' 
           let curContent = header + document.getElementsByTagName('body')[0].innerHTML;

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
