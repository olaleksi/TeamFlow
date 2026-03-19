/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity logging and retrieval endpoints
 */

/**
 * @swagger
 * /activities/project/{projectId}:
 *   get:
 *     summary: Get project activity logs
 *     tags: [Activities]
 *     description: Retrieve all activity logs for a specific project with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityLog'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /activities/task/{taskId}:
 *   get:
 *     summary: Get task activity logs
 *     tags: [Activities]
 *     description: Retrieve all activity logs for a specific task with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityLog'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174003"
 *         projectId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         taskId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         action:
 *           type: string
 *           enum: [
 *             'PROJECT_CREATED',
 *             'PROJECT_UPDATED',
 *             'PROJECT_DELETED',
 *             'MEMBER_ADDED',
 *             'MEMBER_REMOVED',
 *             'MEMBER_ROLE_UPDATED',
 *             'MEMBER_LEFT',
 *             'TASK_CREATED',
 *             'TASK_UPDATED',
 *             'TASK_DELETED',
 *             'TASK_ASSIGNED',
 *             'TASK_STATUS_UPDATED'
 *           ]
 *           example: "TASK_CREATED"
 *         details:
 *           type: object
 *           example: {
 *             taskTitle: "Implement login feature",
 *             taskId: "123e4567-e89b-12d3-a456-426614174001"
 *           }
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *         task:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             title:
 *               type: string
 *         project:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     ActivityLogDetails:
 *       type: object
 *       properties:
 *         TASK_CREATED:
 *           type: object
 *           properties:
 *             taskTitle:
 *               type: string
 *             taskId:
 *               type: string
 *         TASK_UPDATED:
 *           type: object
 *           properties:
 *             changes:
 *               type: object
 *               properties:
 *                 title:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                 status:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                 priority:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                 assignee:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *             taskTitle:
 *               type: string
 *         TASK_ASSIGNED:
 *           type: object
 *           properties:
 *             taskTitle:
 *               type: string
 *             from:
 *               type: string
 *               example: "Unassigned"
 *             to:
 *               type: string
 *               example: "John Doe"
 *         TASK_STATUS_UPDATED:
 *           type: object
 *           properties:
 *             taskTitle:
 *               type: string
 *             from:
 *               type: string
 *               enum: [TODO, IN_PROGRESS, REVIEW, DONE]
 *             to:
 *               type: string
 *               enum: [TODO, IN_PROGRESS, REVIEW, DONE]
 *         MEMBER_ADDED:
 *           type: object
 *           properties:
 *             memberEmail:
 *               type: string
 *             memberName:
 *               type: string
 *             role:
 *               type: string
 *         MEMBER_ROLE_UPDATED:
 *           type: object
 *           properties:
 *             memberEmail:
 *               type: string
 *             memberName:
 *               type: string
 *             oldRole:
 *               type: string
 *             newRole:
 *               type: string
 *         PROJECT_UPDATED:
 *           type: object
 *           properties:
 *             changes:
 *               type: object
 *               properties:
 *                 name:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                 description:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *             projectName:
 *               type: string
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 50
 *         pages:
 *           type: integer
 *           example: 3
 */
