// ============================================================
// Nutri Atende — Entity Types
// TypeScript interfaces matching database schema
// ============================================================
export function classificarIMC(imc) {
    if (imc < 18.5)
        return 'Abaixo do peso';
    if (imc < 25.0)
        return 'Peso normal';
    if (imc < 30.0)
        return 'Sobrepeso';
    if (imc < 35.0)
        return 'Obesidade grau I';
    if (imc < 40.0)
        return 'Obesidade grau II';
    return 'Obesidade grau III';
}
//# sourceMappingURL=entities.js.map