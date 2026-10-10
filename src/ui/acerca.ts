// Contenido de "Acerca del geovisor". La producción científica proviene del formulario SIGP 142806.
const PUBLICACIONES: [string, string][] = [
  ['Affordable risk mapping and detection of asbestos-cement roofs via remote sensing: towards accessible urban digital twins in low- to middle-income countries', 'Journal of Environmental Management, 2026'],
  ['Asbestos Exposure in Low-Middle Income Communities of Cartagena, Colombia: A Survey of Knowledge, Practices, and Environmental Contamination', 'Journal of Occupational and Environmental Medicine, 2025'],
  ['Analysis of Asbestos-Cement Roof Classification in Urban Areas: Supervised and Unsupervised Methods with Multispectral and Hyperspectral Remote Sensing', 'Remote Sensing Applications: Society and Environment, 2025'],
  ['Epidemiological Trends in Mesothelioma Mortality in Colombia (1997–2022): A Retrospective National Study', 'International Journal of Environmental Research and Public Health, 2025'],
  ['Assessment of asbestos-cement roof distribution and prioritized intervention approaches through hyperspectral imaging', 'Heliyon, 2024'],
  ['Mapping roof coverings of asbestos-cement, the first step to control the technical condition/threat and establish priorities for replacement in developing countries', 'Heliyon, 2024'],
  ['Application of Supervised Learning Methods and Information Gain Methods in the Determination of Asbestos-Cement Roofs’ Deterioration State', 'Applied Sciences, 2024'],
  ['A critical review of asbestos concentrations in water and air, according to exposure sources', 'Heliyon, 2023']
];

export function htmlAcerca(): string {
  const anio = new Date().getFullYear();
  return `
    <p>Visor público de la información georreferenciada producida por el proyecto
    <strong>BPIN 2020000100366</strong>, <em>Formulación de una estrategia integral para reducir el impacto sobre la salud
    pública y ambiental por la presencia de asbesto en el territorio del Departamento de Bolívar</em>, ejecutado por la
    Universidad de Cartagena con la Fundación Colombia Libre de Asbesto (FUNDCLAS) y financiado por el Sistema General de Regalías.</p>

    <h3>Qué muestra</h3>
    <ul>
      <li>Cubiertas de asbesto-cemento identificadas por teledetección multiespectral e hiperespectral y aprendizaje automático (1,2 m).</li>
      <li>Superficie de liberación potencial de fibras desde las cubiertas.</li>
      <li>Polvo superficial por aspirado (ASTM D5755), aire y agua analizados por microscopía electrónica de transmisión; materiales por microscopía de luz polarizada (PLM).</li>
      <li>Densidad de la red de acueducto en asbesto-cemento por barrio, con indicadores sociodemográficos.</li>
    </ul>

    <h3>Cómo leer el mapa</h3>
    <p>Las muestras se presentan como mapas de calor, que indican dónde se concentran los resultados sin señalar viviendas
    individuales. Las unidades de polvo superficial se expresan en estructuras de asbesto por centímetro cuadrado (s/cm²).
    Los resultados describen las condiciones del muestreo y no constituyen un diagnóstico sobre personas ni predios.</p>

    <h3>Producción científica asociada</h3>
    <ul class="publicaciones">${PUBLICACIONES.map(([t, r]) => `<li>${t}<span>${r}</span></li>`).join('')}</ul>

    <h3>Datos, código y licencia</h3>
    <p>Código abierto bajo licencia MIT en
    <a href="https://github.com/Aikenort26/geovisor-asbesto" target="_blank" rel="noopener">github.com/Aikenort26/geovisor-asbesto</a>.
    Datos bajo licencia CC BY 4.0. Mapas base © OpenStreetMap, OpenFreeMap y Esri.</p>

    <h3>Cita sugerida</h3>
    <p class="cita">Universidad de Cartagena y FUNDCLAS (${anio}). <em>Geovisor Asbesto Cartagena</em> [aplicación web].
    Proyecto BPIN 2020000100366. ${location.origin}</p>`;
}
