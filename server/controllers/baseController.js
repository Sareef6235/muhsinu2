/**
 * Base Controller with common multi-tenant operations.
 */
export class BaseController {
    static async handleRequest(req, res, logic) {
        try {
            const result = await logic(req);
            return res.json(result);
        } catch (error) {
            console.error('[API Error]', error);
            return res.status(error.status || 500).json({
                error: error.message || 'Internal Server Error'
            });
        }
    }
}
