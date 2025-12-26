/* 
El sistema no trata todas las conexiones por igual. La distinción entre high(alta) y low(baja) es crítica para la legibilidad:

- **Saliency 'high' ($H$):** Son las relaciones principales que definen el concepto. Se suelen renderizar con líneas más gruesas o colores sólidos.
    
- **Saliency 'low' ($L$):** Son detalles secundarios o aclaraciones.

 **Utilidad:** Permite implementar un botón de "Filtro de Ruido"** en la interfaz. Si el grafo es muy complejo, el usuario puede ocultar las aristas 'low' para ver solo la estructura ósea de la explicación
*/
export type RelationshipSaliency = 'high' | 'low'

export interface EdgePair {
  saliency: RelationshipSaliency
  sourceId: string
  targetId: string
} 

export interface EdgeInformation {
  edgeLabel: string
  edgePairs: EdgePair[]
}