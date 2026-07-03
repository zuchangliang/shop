const fs = require('fs')
const path = require('path')
const { compactMpWeixin } = require('./scripts/compact-mp-weixin')

class CopyMpWeixinProjectConfigPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('CopyMpWeixinProjectConfigPlugin', () => {
            if (process.env.UNI_PLATFORM !== 'mp-weixin') {
                return
            }

            const outputMode = process.env.NODE_ENV === 'production' ? 'build' : 'dev'
            const source = path.resolve(__dirname, 'project.config.json')
            const target = path.resolve(
                __dirname,
                'unpackage',
                'dist',
                outputMode,
                'mp-weixin',
                'project.config.json'
            )

            if (!fs.existsSync(source) || !fs.existsSync(path.dirname(target))) {
                return
            }

            fs.copyFileSync(source, target)
            compactMpWeixin(path.dirname(target), { silent: true })
        })
    }
}

module.exports = {
    configureWebpack: {
        plugins: [new CopyMpWeixinProjectConfigPlugin()]
    }
}
