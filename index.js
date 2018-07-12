const Koa = require('koa');
const byteLength = require('byte-length').byteLength;

module.exports = class DebugToolPlugin {
    proxy() {
        return async (ctx, next) => {
            await next();

            const contentType = ctx.res.getHeader('content-type');
            if (contentType && !/html/.test(contentType)) {
                return;
            }

            const getBodyPromise = new Promise((resolve) => {
                let body = '';
                ctx.res.body.on('data', buffer => {
                    body += buffer.toString();
                });
                ctx.res.body.on('end', () => {
                    resolve(body)
                });
            })

            const body = await getBodyPromise;
            const inject = '\n<script src="https://cdn.bootcss.com/eruda/1.4.4/eruda.min.js"></script><script>eruda.init()</script>';
            let index = body.indexOf('<head>');
            if (index !== -1) {
                const result = body.slice(0, index + 6) + inject + body.slice(index + 6, body.length);
                ctx.res.setHeader('content-length', byteLength(result));
                ctx.res.body = result;
                return;
            }

        }
    }
    manage() {
        return new Koa();
    }
}
