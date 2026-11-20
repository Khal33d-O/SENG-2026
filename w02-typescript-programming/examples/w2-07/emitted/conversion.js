export function costly(tiles, threshold) {
    return tiles.filter((tile) => {
        return tile.cost > threshold;
    });
}
//# sourceMappingURL=conversion.js.map