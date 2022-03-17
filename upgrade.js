const fs = require('fs')
const { execSync } = require('child_process')

const web = fs.readFileSync('./web/package.json', 'utf-8')
const webObj = JSON.parse(web)
webObj.version = process.argv[2]
fs.writeFileSync('./web/package.json', JSON.stringify(webObj, null, 2))

const webVersion = fs.readFileSync('./web/src/utils/Constant.ts', 'utf-8')
fs.writeFileSync('./web/src/utils/Constant.ts', webVersion.replace(/export const VERSION \= \'.*\'/, `export const VERSION = '${process.argv[2]}'`))

execSync('cd ./web && yarn install && yarn run build')
execSync(`git add . && git commit -m "${process.argv[2]}"`)