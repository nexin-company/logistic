import { Elysia, t } from 'elysia'
import { ApiKeysService } from './service.js'
import { ApiKeysModel } from './model.js'

export const apiKeysRouter = new Elysia({ prefix: '/api-keys' })
	.get(
		'/',
		async () => {
			const apiKeys = await ApiKeysService.getAllApiKeys();
			return apiKeys;
		},
		{ response: ApiKeysModel.apiKeysList, detail: { tags: ['api-keys'], summary: 'Listar API keys' } }
	)
	.post(
		'/',
		async ({ body }) => {
			const result = await ApiKeysService.createApiKey({
				name: body.name,
				scopes: body.scopes,
				rateLimit: body.rateLimit,
				expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
				createdBy: body.createdBy,
			});
			return result;
		},
		{ body: ApiKeysModel.createBody, response: ApiKeysModel.apiKeyWithKey, detail: { tags: ['api-keys'], summary: 'Crear API key' } }
	)
	.put(
		'/:id',
		async ({ params, body }) => {
			const apiKey = await ApiKeysService.updateApiKey(Number(params.id), {
				name: body.name,
				scopes: body.scopes,
				rateLimit: body.rateLimit,
				expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
				isActive: body.isActive,
			});
			return apiKey;
		},
		{
			params: t.Object({ id: t.Numeric() }),
			body: ApiKeysModel.updateBody,
			response: ApiKeysModel.apiKeyResponse,
			detail: { tags: ['api-keys'], summary: 'Actualizar API key' },
		}
	)
	.delete(
		'/:id',
		async ({ params }) => {
			const apiKey = await ApiKeysService.revokeApiKey(Number(params.id));
			return { message: 'API key revocada exitosamente', data: apiKey };
		},
		{ params: t.Object({ id: t.Numeric() }), detail: { tags: ['api-keys'], summary: 'Revocar API key' } }
	)

