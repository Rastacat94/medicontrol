import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Usar VLM para analizar la imagen del medicamento
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un farmacéutico experto. Analiza la imagen de un medicamento y extrae la siguiente información en formato JSON:
{
  "name": "Nombre comercial del medicamento",
  "genericName": "Nombre genérico o principio activo (si se puede identificar)",
  "dose": número de dosis,
  "doseUnit": "unidad (mg, ml, pastillas, gotas, cápsulas, g, unidades)",
  "laboratory": "Laboratorio farmacéutico (si aparece)",
  "lot": "Número de lote (si aparece)",
  "expiration": "Fecha de caducidad (si aparece)",
  "stockInBox": número de unidades en la caja (si se puede ver),
  "confidence": número entre 0 y 1 indicando la confianza en la identificación
}

Responde SOLO con el JSON, sin texto adicional. Si no puedes identificar algún campo, pon null.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: 'Analiza esta imagen de medicamento y extrae la información. Responde solo con JSON.'
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No se pudo analizar la imagen' },
        { status: 500 }
      );
    }

    // Parsear la respuesta JSON
    let medicationInfo;
    try {
      // Limpiar posibles caracteres extra
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      medicationInfo = JSON.parse(cleanContent);
    } catch {
      // Si no es JSON válido, intentar extraer información del texto
      medicationInfo = {
        name: content,
        confidence: 0.5,
        parseError: true
      };
    }

    return NextResponse.json({
      success: true,
      data: medicationInfo
    });

  } catch (error) {
    console.error('Error analyzing medication image:', error);
    return NextResponse.json(
      { error: 'Error al procesar la imagen. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
