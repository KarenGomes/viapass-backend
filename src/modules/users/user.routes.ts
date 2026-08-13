import { Router } from 'express'
import { AppDataSource } from '../../config/database'
import { authGuard } from '../../middlewares/auth.middleware'
import { validateBody } from '../../middlewares/validate.middleware'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UpdateUserDTO } from './user.dto'
import { User } from './user.entity'

const router = Router()
const controller = new UserController(new UserService(AppDataSource.getRepository(User)))

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Perfil do usuário autenticado
 *     responses:
 *       200:
 *         description: Perfil encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PublicUser' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/me', authGuard, controller.me)

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Atualiza nome e e-mail do próprio usuário
 *     description: O papel não é editável — seria escalada de privilégio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string, example: Ana Ribeiro }
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Perfil atualizado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PublicUser' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 */
router.put('/me', authGuard, validateBody(UpdateUserDTO), controller.updateMe)

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Desativa a própria conta
 *     description: >
 *       Soft-delete via `is_active`. A linha permanece porque pedidos e
 *       ingressos apontam para ela.
 *     responses:
 *       204: { description: Conta desativada. }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.delete('/me', authGuard, controller.deleteMe)

export default router
