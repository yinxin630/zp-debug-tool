module.exports = class Plugin {
    proxy() {
        return async (ctx, next) => {
            await next();
        }
    }
}