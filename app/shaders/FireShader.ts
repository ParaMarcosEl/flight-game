// shaders/fireParticle.ts
export const fireVertexShader = `
uniform float pointMultiplier;
attribute float size;
attribute vec4 colour;
attribute float angle;

varying vec4 vColor;
varying float vAngle;

void main() {
    vColor = colour;
    vAngle = angle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Set size based on distance to camera
    gl_PointSize = size * (pointMultiplier / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const fireFragmentShader = `
uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying float vAngle;

void main() {
    // Rotate the UVs to match particle rotation
    vec2 center = vec2(0.5);
    vec2 rotated = gl_PointCoord - center;

    float s = sin(vAngle);
    float c = cos(vAngle);
    rotated = vec2(
        c * rotated.x - s * rotated.y,
        s * rotated.x + c * rotated.y
    ) + center;

    vec4 tex = texture2D(diffuseTexture, rotated);
    
    // Output with additive blending and per-particle color
    gl_FragColor = tex * vColor;
    
    // Discard low alpha to clean edges
    if (gl_FragColor.a < 0.1) discard;
}
`;
