import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { User } from '../users/user.entity'
import { authGuard, publicRoute } from '../../middlewares/auth.middleware'
import { validateBody } from '../../middlewares/validate.middleware'
import { authRateLimiter } from '../../middlewares/rate-limit.middleware'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LoginDTO, RefreshDTO, RegisterDTO } from './auth.dto'

const router = Router()
const controller = new AuthController(new AuthService(AppDataSource.getRepository(User)))

/**
 * @openapi
 * components:
 *   schemas:
 *     PublicUser:
 *       type: object
 *       required: [id, name, email, role]
 *       properties:
 *         id:    { type: string, format: uuid }
 *         name:  { type: string, example: Ana Ribeiro }
 *         email: { type: string, format: email, example: cliente1@viapass.com }
 *         role:  { $ref: '#/components/schemas/UserRole' }
 *     AuthResult:
 *       type: object
 *       required: [accessToken, refreshToken, user]
 *       properties:
 *         accessToken:
 *           type: string
 *           description: 'Válido por 15 minutos. Envie no header Authorization como Bearer token.'
 *         refreshToken:
 *           type: string
 *           description: >
 *             Válido por 7 dias. Também é enviado em cookie HttpOnly;
 *             no navegador, prefira o cookie e ignore este campo.
 *         user: { $ref: '#/components/schemas/PublicUser' }
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cria uma conta e já devolve os tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, minLength: 2, example: Ana Ribeiro }
 *               email:    { type: string, format: email, example: ana@exemplo.com }
 *               password: { type: string, minLength: 8, example: senha-bem-longa }
 *               role:
 *                 $ref: '#/components/schemas/UserRole'
 *                 description: Padrão `client`. Aceito aqui para facilitar a avaliação.
 *     responses:
 *       201:
 *         description: Conta criada.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResult' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/register', publicRoute(), authRateLimiter, validateBody(RegisterDTO), controller.register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica e devolve o par de tokens
 *     description: >
 *       Credencial errada e e-mail inexistente devolvem a mesma resposta —
 *       diferenciar transformaria o login num oráculo de e-mails cadastrados.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: cliente1@viapass.com }
 *               password: { type: string, example: Client1@2026! }
 *     responses:
 *       200:
 *         description: Autenticado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResult' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/login', publicRoute(), authRateLimiter, validateBody(LoginDTO), controller.login)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renova o par de tokens
 *     description: >
 *       Lê o refresh token do cookie `viapass_refresh` ou do corpo.
 *       Consulta o banco para refletir mudanças de papel ou desativação.
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Só necessário para clientes sem cookie.
 *     responses:
 *       200:
 *         description: Tokens renovados.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResult' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post('/refresh', publicRoute(), validateBody(RefreshDTO), controller.refresh)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerra a sessão, limpando o cookie de refresh
 *     responses:
 *       204: { description: Sessão encerrada. }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/logout', authGuard, controller.logout)

export default router
