const Koa = require('koa');
const Static = require('koa-static');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');
const path = require('path');
const fs = require('fs');
const { byteLength } = require('byte-length');
const jsonfile = require('jsonfile');
const os = require('os');
const ip = require('ip');
const zlib = require('zlib');

process.env.PORT = 9998;
require('vorlon');

const zpConfigPath = `${os.homedir()}/.front-end-proxy`;
const configFilePath = `${zpConfigPath}/zp-debug-tool.config.js`;

const erudaScript = '\n<script src="https://cdn.bootcss.com/eruda/1.4.4/eruda.min.js"></script><script>eruda.init()</script>\n';

module.exports = class DebugToolPlugin {
    /**
     * gzip转string
     * @param {Buffer} gzip gzip编码数据
     */
    static async gzipToString(gzip) {
        return new Promise((resolve, reject) => {
            zlib.gunzip(gzip, (err, dezipped) => {
                if (!err) {
                    return resolve(dezipped.toString());
                }
                reject(err);
            });
        });
    }

    constructor() {
        this.config = {
            eruda: true, // 是否插入eruda
            vorlon: true, // 是否插入vorlon
            custom: true, // 是否插入自定义内容
            customContent: '', // 自定义的内容
        };

        this.readConfig();
    }

    // 读取配置文件
    readConfig() {
        if (fs.existsSync(configFilePath)) {
            jsonfile.readFile(configFilePath, (err, config) => {
                if (!err) {
                    Object.assign(this.config, config);
                }
            });
        }
    }

    // 写入配置文件
    writeConfig() {
        if (fs.existsSync(zpConfigPath)) {
            jsonfile.writeFile(configFilePath, this.config, (err) => {
                if (err) {
                    console.error('"zp-debug-tool" 插件保存配置失败');
                }
            });
        }
    }

    // 插件核心功能, 改写响应
    proxy() {
        return async (ctx, next) => {
            console.log(ctx.req.url);
            await next();

            const contentType = ctx.res.getHeader('content-type');
            if (
                /socket\.io/.test(ctx.req.url) // 来自socket.io的不处理
                || contentType && !/html/.test(contentType) // 非html响应不处理
            ) {
                return;
            }

            const contentEncoding = ctx.res.getHeader('content-encoding');
            const getBodyPromise = new Promise((resolve) => {
                let body = Buffer.allocUnsafe(0);
                ctx.res.body.on('data', (buffer) => {
                    body = Buffer.concat([body, buffer]);
                });
                ctx.res.body.on('end', () => {
                    resolve(body);
                });
            });

            const body = await getBodyPromise;

            let bodyStr = '';
            if (contentEncoding === 'gzip') {
                try {
                    bodyStr = await DebugToolPlugin.gzipToString(body);
                    ctx.res.removeHeader('content-encoding');
                } catch (err) {
                    console.error('gzip转string失败', err);
                }
            } else {
                bodyStr = body.toString();
            }

            let inject = '';
            if (this.config.eruda) {
                inject += erudaScript;
            }
            if (this.config.vorlon) {
                inject += `<script src="http://${ip.address()}:${process.env.PORT}/vorlon.js"></script>`;
            }
            if (this.config.custom) {
                inject += this.config.customContent;
            }

            const index = bodyStr.indexOf('<head>');
            if (index !== -1) {
                const result = bodyStr.slice(0, index + 6) + inject + bodyStr.slice(index + 6, bodyStr.length);
                ctx.res.setHeader('content-length', byteLength(result));
                ctx.res.body = result;
            }
        };
    }

    // 插件web管理端
    manage() {
        const app = new Koa();
        app.use(Static(path.resolve(__dirname, './static')));
        app.use(BodyParser());
        const router = new Router();
        router.get('/config', async (ctx) => {
            ctx.body = Object.assign({
                vorlonPort: process.env.PORT,
            }, this.config);
        });
        router.post('/eruda', async (ctx) => {
            this.config.eruda = ctx.request.body.enable;
            this.writeConfig();
            ctx.body = { msg: 'ok' };
        });
        router.post('/vorlon', async (ctx) => {
            this.config.vorlon = ctx.request.body.enable;
            this.writeConfig();
            ctx.body = { msg: 'ok' };
        });
        router.post('/custom', async (ctx) => {
            this.config.custom = ctx.request.body.enable;
            this.writeConfig();
            ctx.body = { msg: 'ok' };
        });
        router.post('/customContent', async (ctx) => {
            this.config.customContent = ctx.request.body.customContent;
            this.writeConfig();
            ctx.body = { msg: 'ok' };
        });
        app.use(router.routes());
        app.use(router.allowedMethods());
        return app;
    }
};
