import { Position, type Node } from "@xyflow/react";

export function getNodeIntersection(intersectionNode: Node, targetNode: Node) {
    const {
        measured: { width: w = 0, height: h = 0 } = {},
        position: { x = 0, y = 0 } = {},
    } = intersectionNode as any;

    const target = targetNode as any;
    const {
        position: { x: tx = 0, y: ty = 0 } = {},
        measured: { width: tw = 0, height: th = 0 } = {},
    } = target;

    const w2 = w / 2;
    const h2 = h / 2;

    const tw2 = tw / 2;
    const th2 = th / 2;

    const xx1 = x + w2;
    const yy1 = y + h2;
    const xx2 = tx + tw2;
    const yy2 = ty + th2;

    const dx = xx2 - xx1;
    const dy = yy2 - yy1;

    if (dx === 0 && dy === 0) {
        return { x: xx1, y: yy1 };
    }

    // Calculate intersection with the node's bounding box
    const m = dy / dx;

    if (Math.abs(dx) > Number.EPSILON) {
        if (dx > 0) {
            // potential intersection with right edge
            const rightX = x + w;
            const rightY = yy1 + m * (rightX - xx1);
            if (rightY >= y && rightY <= y + h) {
                return { x: rightX, y: rightY };
            }
        } else {
            // potential intersection with left edge
            const leftX = x;
            const leftY = yy1 + m * (leftX - xx1);
            if (leftY >= y && leftY <= y + h) {
                return { x: leftX, y: leftY };
            }
        }
    }

    if (Math.abs(dy) > Number.EPSILON) {
        if (dy > 0) {
            // potential intersection with bottom edge
            const bottomY = y + h;
            const bottomX = xx1 + (bottomY - yy1) / m;
            if (bottomX >= x && bottomX <= x + w) {
                return { x: bottomX, y: bottomY };
            }
        } else {
            // potential intersection with top edge
            const topY = y;
            const topX = xx1 + (topY - yy1) / m;
            if (topX >= x && topX <= x + w) {
                return { x: topX, y: topY };
            }
        }
    }

    return { x: xx1, y: yy1 };
}

function getEdgePosition(
    node: Node,
    intersectionPoint: { x: number; y: number }
) {
    const {
        position: { x = 0, y = 0 } = {},
        measured: { width: w = 0, height: h = 0 } = {},
    } = node as any;

    const cx = x + w / 2;
    const cy = y + h / 2;
    const px = intersectionPoint.x;
    const py = intersectionPoint.y;

    if (px <= x + 1 && Math.abs(py - cy) <= h / 2) return Position.Left;
    if (px >= x + w - 1 && Math.abs(py - cy) <= h / 2) return Position.Right;
    if (py <= y + 1 && Math.abs(px - cx) <= w / 2) return Position.Top;
    if (py >= y + h - 1 && Math.abs(px - cx) <= w / 2) return Position.Bottom;

    return Position.Top;
}

export function getEdgeParams(source: Node, target: Node) {
    const sourceIntersection = getNodeIntersection(source, target);
    const targetIntersection = getNodeIntersection(target, source);

    const sourcePos = getEdgePosition(source, sourceIntersection);
    const targetPos = getEdgePosition(target, targetIntersection);

    return {
        sx: sourceIntersection.x,
        sy: sourceIntersection.y,
        tx: targetIntersection.x,
        ty: targetIntersection.y,
        sourcePos,
        targetPos,
    };
}
