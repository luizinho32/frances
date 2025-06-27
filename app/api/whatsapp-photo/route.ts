import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: "Le numéro de téléphone est obligatoire" }, { status: 400 })
    }

    // Supprime les caractères non numériques
    const cleanPhone = phone.replace(/[^0-9]/g, "")

    // Ajoute le code pays si absent (en supposant la France +33)
    let fullNumber = cleanPhone
    if (!cleanPhone.startsWith("33") && cleanPhone.length === 10) {
      fullNumber = "33" + cleanPhone.substring(1) // Retire le 0 initial pour la France
    }

    console.log("Recherche de photo pour le numéro:", fullNumber)

    // Fait une requête à l'API externe
    const apiUrl = `https://primary-production-aac6.up.railway.app/webhook/request_photo?tel=${fullNumber}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Origin: "https://whatspy.chat",
      },
    })

    if (!response.ok) {
      throw new Error(`L'API a retourné le statut: ${response.status}`)
    }

    const data = await response.json()
    console.log("Réponse de l'API:", data)

    // Vérifie si la photo est privée ou par défaut
    const isPhotoPrivate = !data.link || data.link === null || data.link.includes("no-user-image-icon")

    return NextResponse.json({
      success: true,
      result: isPhotoPrivate
        ? "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
        : data.link,
      is_photo_private: isPhotoPrivate,
    })
  } catch (error) {
    console.error("Erreur dans l'API WhatsApp:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la recherche de la photo de profil",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
