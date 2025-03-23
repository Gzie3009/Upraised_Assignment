import express from 'express';
import { 
  getGadgets, 
  createGadget, 
  updateGadget, 
  deleteGadget,
  selfDestruct 
} from '../controllers/gadgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

export const router = express.Router();

router.use(protect);
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Gadget:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         codename:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Available, Deployed, Destroyed, Decommissioned]
 *         decommissionedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/gadgets:
 *   get:
 *     summary: Get all gadgets
 *     tags: [Gadgets]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       200:
 *         description: List of gadgets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gadget'
 */
router.route('/')
  .get(
    [
      query('status')
        .optional()
        .isIn(['Available', 'Deployed', 'Destroyed', 'Decommissioned'])
        .withMessage('Invalid gadget status')
    ],
    validateRequest,
    getGadgets
  )
  /**
   * @swagger
   * /api/gadgets:
   *   post:
   *     summary: Create a new gadget
   *     tags: [Gadgets]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *     responses:
   *       201:
   *         description: Gadget created successfully
   *       400:
   *         description: Invalid input data
   */
  .post(
    [
      body('name')
        .notEmpty()
        .withMessage('Gadget name is required')
        .isLength({ min: 2 })
        .withMessage('Gadget name must be at least 2 characters long')
    ],
    validateRequest,
    createGadget
  );

/**
 * @swagger
 * /api/gadgets/{id}:
 *   patch:
 *     summary: Update a gadget
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               status:
 *                 type: string
 *                 enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *       404:
 *         description: Gadget not found
 */
router.route('/:id')
  .patch(
    [
      param('id').isUUID().withMessage('Invalid gadget ID'),
      body('name')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Gadget name must be at least 2 characters long'),
      body('status')
        .optional()
        .isIn(['Available', 'Deployed', 'Destroyed', 'Decommissioned'])
        .withMessage('Invalid status')
    ],
    validateRequest,
    updateGadget
  )
  /**
   * @swagger
   * /api/gadgets/{id}:
   *   delete:
   *     summary: Decommission a gadget
   *     tags: [Gadgets]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Gadget decommissioned successfully
   *       404:
   *         description: Gadget not found
   */
  .delete(
    [param('id').isUUID().withMessage('Invalid gadget ID')],
    validateRequest,
    deleteGadget
  );

/**
 * @swagger
 * /api/gadgets/{id}/self-destruct:
 *   post:
 *     summary: Trigger self-destruct sequence for a gadget
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmationCode
 *             properties:
 *               confirmationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Self-destruct sequence completed
 *       400:
 *         description: Invalid confirmation code
 *       404:
 *         description: Gadget not found
 */
router.post(
  '/:id/self-destruct',
  [
    param('id').isUUID().withMessage('Invalid gadget ID'),
    body('confirmationCode')
      .notEmpty()
      .withMessage('Confirmation code is required')
  ],
  validateRequest,
  selfDestruct
);