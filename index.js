const Koa = require('koa');
const Static = require('koa-static');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');
const path = require('path');
const { byteLength } = require('byte-length');

const erudaScript = '\n<script src="https://cdn.bootcss.com/eruda/1.4.4/eruda.min.js"></script><script>eruda.init()</script>\n';

module.exports = class DebugToolPlugin {
    constructor() {
        this.config = {
            eruda: true, // 是否插入eruda
            custom: true, // 是否插入自定义内容
            customContent: '', // 自定义的内容
        };
    }

    proxy() {
        return async (ctx, next) => {
            await next();

            const contentType = ctx.res.getHeader('content-type');
            if (contentType && !/html/.test(contentType)) {
                return;
            }

            const getBodyPromise = new Promise((resolve) => {
                let body = '';
                ctx.res.body.on('data', (buffer) => {
                    body += buffer.toString();
                });
                ctx.res.body.on('end', () => {
                    resolve(body);
                });
            });

            const body = await getBodyPromise;
            let inject = '';
            if (this.config.eruda) {
                inject += erudaScript;
            }
            if (this.config.custom) {
                inject += this.config.customContent;
            }

            const index = body.indexOf('<head>');
            if (index !== -1) {
                const result = body.slice(0, index + 6) + inject + body.slice(index + 6, body.length);
                ctx.res.setHeader('content-length', byteLength(result));
                ctx.res.body = result;
            }
        };
    }

    manage() {
        const app = new Koa();
        app.use(Static(path.resolve(__dirname, './static')));
        app.use(BodyParser());
        const router = new Router();
        router.get('/config', async (ctx) => {
            ctx.body = this.config;
        });
        router.post('/eruda', async (ctx) => {
            this.config.eruda = ctx.request.body.enable;
            ctx.body = { msg: 'ok' };
        });
        router.post('/customContent', async (ctx) => {
            this.config.customContent = ctx.request.body.customContent;
            ctx.body = { msg: 'ok' };
        });
        app.use(router.routes());
        app.use(router.allowedMethods());
        return app;
    }
};
