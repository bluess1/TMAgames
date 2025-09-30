// games/geometry-dash/physics.js - Physics Engine for Geometry Dash
class PhysicsEngine {
    constructor() {
        this.gravity = 0.8;
        this.terminalVelocity = 20;
        this.jumpPower = -15;
        this.groundFriction = 0.8;
        this.airResistance = 0.99;
        this.bounceDecay = 0.7;
    }

    // Apply gravity to an entity
    applyGravity(entity) {
        if (!entity.isGrounded && entity.velocityY < this.terminalVelocity) {
            entity.velocityY += this.gravity;
        }
    }

    // Apply friction (for ground movement)
    applyFriction(entity) {
        if (entity.isGrounded && entity.velocityX) {
            entity.velocityX *= this.groundFriction;
            if (Math.abs(entity.velocityX) < 0.1) {
                entity.velocityX = 0;
            }
        }
    }

    // Apply air resistance
    applyAirResistance(entity) {
        if (!entity.isGrounded) {
            entity.velocityX *= this.airResistance;
            entity.velocityY *= this.airResistance;
        }
    }

    // Handle jumping physics
    jump(entity) {
        if (entity.isGrounded) {
            entity.velocityY = this.jumpPower;
            entity.isGrounded = false;
            return true;
        }
        return false;
    }

    // Update entity position based on velocity
    updatePosition(entity) {
        entity.x += entity.velocityX || 0;
        entity.y += entity.velocityY || 0;
    }

    // Check and handle ground collision
    handleGroundCollision(entity, groundY) {
        if (entity.y + entity.height >= groundY) {
            entity.y = groundY - entity.height;
            entity.velocityY = 0;
            entity.isGrounded = true;
            return true;
        }
        return false;
    }

    // Check collision between two rectangles
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Check collision with tolerance (for more forgiving gameplay)
    checkCollisionWithTolerance(rect1, rect2, tolerance = 0) {
        return (rect1.x + tolerance) < (rect2.x + rect2.width - tolerance) &&
               (rect1.x + rect1.width - tolerance) > (rect2.x + tolerance) &&
               (rect1.y + tolerance) < (rect2.y + rect2.height - tolerance) &&
               (rect1.y + rect1.height - tolerance) > (rect2.y + tolerance);
    }

    // Check if point is inside rectangle
    pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }

    // Get distance between two points
    getDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Handle bounce physics (for future bouncy obstacles)
    handleBounce(entity, surface) {
        // Determine bounce direction based on collision side
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        const surfaceCenterX = surface.x + surface.width / 2;
        const surfaceCenterY = surface.y + surface.height / 2;

        const dx = entityCenterX - surfaceCenterX;
        const dy = entityCenterY - surfaceCenterY;

        // Determine collision side
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > absDy) {
            // Horizontal collision
            entity.velocityX = -entity.velocityX * this.bounceDecay;
            if (dx > 0) {
                entity.x = surface.x + surface.width;
            } else {
                entity.x = surface.x - entity.width;
            }
        } else {
            // Vertical collision
            entity.velocityY = -entity.velocityY * this.bounceDecay;
            if (dy > 0) {
                entity.y = surface.y + surface.height;
            } else {
                entity.y = surface.y - entity.height;
                entity.isGrounded = true;
            }
        }
    }

    // Calculate trajectory for projectiles
    calculateTrajectory(startX, startY, velocityX, velocityY, steps = 50) {
        const trajectory = [];
        let x = startX;
        let y = startY;
        let vx = velocityX;
        let vy = velocityY;

        for (let i = 0; i < steps; i++) {
            trajectory.push({ x: x, y: y });
            x += vx;
            y += vy;
            vy += this.gravity;
            vx *= this.airResistance;
            vy *= this.airResistance;
        }

        return trajectory;
    }

    // Handle collision response for different obstacle types
    handleObstacleCollision(entity, obstacle, type = 'deadly') {
        switch (type) {
            case 'deadly':
                return { 
                    result: 'death',
                    entity: entity,
                    obstacle: obstacle
                };

            case 'bouncy':
                this.handleBounce(entity, obstacle);
                return { 
                    result: 'bounce',
                    entity: entity,
                    obstacle: obstacle
                };

            case 'solid':
                this.handleSolidCollision(entity, obstacle);
                return { 
                    result: 'blocked',
                    entity: entity,
                    obstacle: obstacle
                };

            case 'portal':
                return { 
                    result: 'teleport',
                    entity: entity,
                    obstacle: obstacle
                };

            default:
                return { 
                    result: 'none',
                    entity: entity,
                    obstacle: obstacle
                };
        }
    }

    // Handle solid obstacle collision (push entity out)
    handleSolidCollision(entity, obstacle) {
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;

        const dx = entityCenterX - obstacleCenterX;
        const dy = entityCenterY - obstacleCenterY;

        const overlapX = (entity.width + obstacle.width) / 2 - Math.abs(dx);
        const overlapY = (entity.height + obstacle.height) / 2 - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
                // Horizontal separation
                if (dx > 0) {
                    entity.x = obstacle.x + obstacle.width;
                } else {
                    entity.x = obstacle.x - entity.width;
                }
                entity.velocityX = 0;
            } else {
                // Vertical separation
                if (dy > 0) {
                    entity.y = obstacle.y + obstacle.height;
                    entity.velocityY = 0;
                } else {
                    entity.y = obstacle.y - entity.height;
                    entity.velocityY = 0;
                    entity.isGrounded = true;
                }
            }
        }
    }

    // Update physics for a single entity
    updateEntity(entity, groundY) {
        // Store previous position for collision resolution
        entity.prevX = entity.x;
        entity.prevY = entity.y;

        // Apply physics forces
        this.applyGravity(entity);
        this.applyFriction(entity);
        this.applyAirResistance(entity);

        // Update position
        this.updatePosition(entity);

        // Handle ground collision
        this.handleGroundCollision(entity, groundY);

        // Keep entity in bounds (optional)
        if (entity.y > groundY + 100) {
            // Entity fell off the world
            return { result: 'fell', entity: entity };
        }

        return { result: 'updated', entity: entity };
    }

    // Batch update multiple entities
    updateEntities(entities, groundY) {
        const results = [];
        entities.forEach(entity => {
            if (entity.alive !== false) {
                const result = this.updateEntity(entity, groundY);
                results.push(result);
            }
        });
        return results;
    }

    // Advanced collision detection with swept AABB
    sweptAABB(entity, obstacle) {
        const xInvEntry = entity.velocityX > 0 ? 
            obstacle.x - (entity.x + entity.width) :
            (obstacle.x + obstacle.width) - entity.x;
        
        const yInvEntry = entity.velocityY > 0 ? 
            obstacle.y - (entity.y + entity.height) :
            (obstacle.y + obstacle.height) - entity.y;

        const xInvExit = entity.velocityX > 0 ? 
            (obstacle.x + obstacle.width) - entity.x :
            obstacle.x - (entity.x + entity.width);
        
        const yInvExit = entity.velocityY > 0 ? 
            (obstacle.y + obstacle.height) - entity.y :
            obstacle.y - (entity.y + entity.height);

        const xEntry = entity.velocityX === 0 ? -Infinity : xInvEntry / entity.velocityX;
        const yEntry = entity.velocityY === 0 ? -Infinity : yInvEntry / entity.velocityY;
        const xExit = entity.velocityX === 0 ? Infinity : xInvExit / entity.velocityX;
        const yExit = entity.velocityY === 0 ? Infinity : yInvExit / entity.velocityY;

        const entryTime = Math.max(xEntry, yEntry);
        const exitTime = Math.min(xExit, yExit);

        if (entryTime > exitTime || (xEntry < 0 && yEntry < 0) || xEntry > 1 || yEntry > 1) {
            return {
                hit: false,
                time: 1,
                normal: { x: 0, y: 0 }
            };
        }

        let normal = { x: 0, y: 0 };
        if (xEntry > yEntry) {
            normal.x = xInvEntry < 0 ? 1 : -1;
        } else {
            normal.y = yInvEntry < 0 ? 1 : -1;
        }

        return {
            hit: true,
            time: entryTime,
            normal: normal
        };
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PhysicsEngine = PhysicsEngine;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
