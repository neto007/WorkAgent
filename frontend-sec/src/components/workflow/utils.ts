import type { Node, NodePositionChange, XYPosition } from "@xyflow/react";

type GetHelperLinesResult = {
    horizontal?: number;
    vertical?: number;
    snapPosition: Partial<XYPosition>;
};

// This utility function can be called with a position change (inside onNodesChange)
// It checks all other nodes and calculates the helper line positions and the position where the current node should snap to
export function getHelperLines(
    change: NodePositionChange,
    nodes: Node[],
    distance = 5,
): GetHelperLinesResult {
    const defaultResult = {
        horizontal: undefined,
        vertical: undefined,
        snapPosition: { x: undefined, y: undefined },
    };
    const nodeA = nodes.find((node) => node.id === change.id);

    if (!nodeA || !change.position) {
        return defaultResult;
    }

    const nodeABounds = {
        left: change.position.x,
        right: change.position.x + (nodeA.measured?.width ?? 0),
        top: change.position.y,
        bottom: change.position.y + (nodeA.measured?.height ?? 0),
        width: nodeA.measured?.width ?? 0,
        height: nodeA.measured?.height ?? 0,
    };

    let horizontalDistance = distance;
    let verticalDistance = distance;

    return nodes
        .filter((node) => node.id !== nodeA.id)
        .reduce<GetHelperLinesResult>((result, nodeB) => {
            const nodeBBounds = {
                left: nodeB.position.x,
                right: nodeB.position.x + (nodeB.measured?.width ?? 0),
                top: nodeB.position.y,
                bottom: nodeB.position.y + (nodeB.measured?.height ?? 0),
                width: nodeB.measured?.width ?? 0,
                height: nodeB.measured?.height ?? 0,
            };

            // Left-to-left alignment
            const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left);
            if (distanceLeftLeft < verticalDistance) {
                result.snapPosition.x = nodeBBounds.left;
                result.vertical = nodeBBounds.left;
                verticalDistance = distanceLeftLeft;
            }

            // Right-to-right alignment
            const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right);
            if (distanceRightRight < verticalDistance) {
                result.snapPosition.x = nodeBBounds.right - nodeABounds.width;
                result.vertical = nodeBBounds.right;
                verticalDistance = distanceRightRight;
            }

            // Left-to-right alignment
            const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right);
            if (distanceLeftRight < verticalDistance) {
                result.snapPosition.x = nodeBBounds.right;
                result.vertical = nodeBBounds.right;
                verticalDistance = distanceLeftRight;
            }

            // Right-to-left alignment
            const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left);
            if (distanceRightLeft < verticalDistance) {
                result.snapPosition.x = nodeBBounds.left - nodeABounds.width;
                result.vertical = nodeBBounds.left;
                verticalDistance = distanceRightLeft;
            }

            // Top-to-top alignment
            const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top);
            if (distanceTopTop < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.top;
                result.horizontal = nodeBBounds.top;
                horizontalDistance = distanceTopTop;
            }

            // Bottom-to-top alignment
            const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top);
            if (distanceBottomTop < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.top - nodeABounds.height;
                result.horizontal = nodeBBounds.top;
                horizontalDistance = distanceBottomTop;
            }

            // Bottom-to-bottom alignment
            const distanceBottomBottom = Math.abs(nodeABounds.bottom - nodeBBounds.bottom);
            if (distanceBottomBottom < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height;
                result.horizontal = nodeBBounds.bottom;
                horizontalDistance = distanceBottomBottom;
            }

            // Top-to-bottom alignment
            const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom);
            if (distanceTopBottom < horizontalDistance) {
                result.snapPosition.y = nodeBBounds.bottom;
                result.horizontal = nodeBBounds.bottom;
                horizontalDistance = distanceTopBottom;
            }

            return result;
        }, defaultResult);
}
