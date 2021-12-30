#!/usr/bin/env node

// 参考自： https://github.com/vitejs/vite/blob/v2.4.3/packages/create-vite/index.js

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const argv = require('minimist')(process.argv.slice(2))
const prompts = require('prompts')
const { yellow, green, cyan, blue, magenta, lightRed, red } = require('kolorist')

const cwd = process.cwd()

const packagesPath = 'packages'
const templatePath = 'templates'
const projectScope = '@fdqfe'

const TEMPLATES = fs.readdirSync(path.resolve(cwd,'templates'))

const renameFiles = {
  _gitignore: '.gitignore'
}

async function init(){
  let targetDir = argv._[0]
  const template = argv.template || argv.t

  let result = {}

  try {
    result = await prompts([
      {
        type:targetDir?null:'text',
        name:'projectName',
        message:'Project name:',
        onState: state=> targetDir = state.value.trim()
      },
      {
        type:()=> !fs.existsSync(path.resolve(cwd,packagesPath,targetDir)) || isEmpty(path.resolve(cwd,packagesPath,targetDir))?null:'confirm',
        name:'overwrite',
        message:()=>{
          return targetDir === '.' 
          ? 'Current directory'
          : `Target directory ${targetDir}`
          + ` is not empty. Remove existing files and continue?`
        }
      },
      {
        type:(_,{overwrite})=>{
          if(overwrite === false){
            // throw new Error(red('✖') + ' Operation cancelled')
            throw new Error(red('✖') + ' Operation cancelled')
          }
          return null 
        },
        name: 'overwriteChecker'
      },
      {
        type:template && TEMPLATES.includes(template)!==-1?null:'select',
        name:'template',
        message: 'Select a template:',
        initial: 0,
        choices:TEMPLATES.map(t=>({
          title:yellow(t),
          value:t
        }))
      }
    ]
    )
  } catch (e) {
    return
    }

  const {overwrite} = result
  const projectName = targetDir || result.projectName
  const root  = path.resolve(cwd,packagesPath,projectName)

  if(overwrite){
    emptyDir(root)
  }else if(!fs.existsSync(root)){
    fs.mkdirSync(root)
  }

  console.log(`\n${green('Scaffolding project in')} ${root}...\n`)

  execSync(`lerna create ${projectName} ${packagesPath} --yes`)

  const templateDir = path.join(cwd, templatePath, template || result.template)

  const write = (file,content) => {
    const targetPath = renameFiles[file]
    ?path.resolve(root,renameFiles[file])
    :path.resolve(root,file)


    if(content){
      fs.writeFileSync(targetPath,content)
    }else{
      copy(path.resolve(templateDir,file),targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter(f=>f!='package.json')) {
    write(file)
  }

  write('package.json' ,getPackageJson(root,templateDir,projectName))
  
  if (fs.existsSync(path.join(templateDir, `vite.config.js`))) {
    write('vite.config.js' ,getViteConfig(templateDir,projectName))
  }

  console.log(green(`\nDone. Now run:\n`))
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`)
  }
  console.log(`  npm install`)
  console.log(`  npm run dev`)
  console.log()
}

function isEmpty(path){
  return fs.readdirSync(path).length === 0
}

function emptyDir(dir){
  if(!fs.existsSync(dir)) return

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir,file)

    if(fs.statSync(abs).isDirectory()){
      emptyDir(abs)
      fs.rmdirSync(abs)
    }else{
      fs.unlinkSync(abs)
    }
  }

}

function copy(src,desc){
  const stat = fs.statSync(src)

  if(stat.isDirectory()){
    copyDir(src,desc)
  }else{
    fs.copyFileSync(src,desc)
  }
}

function copyDir(src,desc){
  fs.mkdirSync(desc,{recursive:true})
  for (const file of fs.readdirSync(src)) {
    const srcFile = path.resolve(src,file)
    const destFile = path.resolve(desc,file)
    copy(srcFile,destFile)
  }

}

// 生成 package.json 文件内容
function getPackageJson (root, templateDir, projectName) {
  // 替换其中的 $name 为 projectName
  const pkg = require(path.join(templateDir, `package.json`))
  const package = require(path.resolve(root, `package.json`))

  const packageJson = Object.assign({}, package, pkg)
  const packageName = `${projectScope}/${projectName.toLowerCase()}`
  packageJson.name = packageName

  return JSON.stringify(packageJson, null, 2)
    .replace(/\$name/g, projectName.toLowerCase())
    .replace(/\$packagename/g, packageName)
}

// 生成 vite.config.js 文件内容
function getViteConfig (templateDir, projectName) {
  // 替换其中的 $name 为 projectName
  const viteConfig = fs.readFileSync(path.join(templateDir, `vite.config.js`), { encoding: 'utf-8' })

  return viteConfig.replace(/\$name/g, projectName.toLowerCase().replace(/^\S/, s => s.toUpperCase()))
}


init().catch(e=>console.error(e))