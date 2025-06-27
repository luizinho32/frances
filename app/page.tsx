"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Wifi,
  Camera,
  User,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
  AlertTriangle,
  Lock,
  Activity,
  Eye,
  CheckCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useGeolocation } from "@/hooks/useGeolocation"

type AppStep = "landing" | "form" | "verification" | "preliminary" | "generating" | "result" | "offer"

// Messages de preuve de vente mis à jour sans villes/états spécifiques
const SalesProofPopup = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const [currentMessage, setCurrentMessage] = useState("")

  const salesMessages = [
    "✅ Anna, près de chez vous, a débloqué un rapport il y a 3 minutes",
    "✅ Charles, récemment, a consulté l'historique des conversations",
    "✅ Amanda vient de révéler des photos confidentielles",
    "✅ Luc a terminé une analyse complète à l'instant",
    "✅ Félicité a accédé au rapport confidentiel il y a quelques instants",
    "✅ Jean a effectué une vérification complète à l'instant",
  ]

  useEffect(() => {
    if (show) {
      const randomMessage = salesMessages[Math.floor(Math.random() * salesMessages.length)]
      setCurrentMessage(randomMessage)
    }
  }, [show])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: -20 }}
      className="fixed bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-xs z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 sm:p-4"
      style={{
        fontSize: "13px",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-800 leading-tight">{currentMessage}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 flex-shrink-0"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function SigiloX() {
  const [currentStep, setCurrentStep] = useState<AppStep>("landing")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [lastTinderUse, setLastTinderUse] = useState("")
  const [cityChange, setCityChange] = useState("")
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [isPhotoPrivate, setIsPhotoPrivate] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [verificationMessage, setVerificationMessage] = useState("Démarrage de l'analyse...")
  const [generatingProgress, setGeneratingProgress] = useState(0)
  const [generatingMessage, setGeneratingMessage] = useState("Analyse des photos de profil...")
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 50) // 9:50
  const [showSalesPopup, setShowSalesPopup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSalesProof, setShowSalesProof] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const [selectedCountry, setSelectedCountry] = useState({
    code: "+33",
    name: "France",
    flag: "🇫🇷",
    placeholder: "06 12 34 56 78",
  })
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  const countries = [
    { code: "+33", name: "France", flag: "🇫🇷", placeholder: "06 12 34 56 78" },
    { code: "+32", name: "Belgique", flag: "🇧🇪", placeholder: "470 12 34 56" },
    { code: "+41", name: "Suisse", flag: "🇨🇭", placeholder: "78 123 45 67" },
    { code: "+1", name: "États-Unis", flag: "🇺🇸", placeholder: "(555) 123-4567" },
    { code: "+1", name: "Canada", flag: "🇨🇦", placeholder: "(555) 123-4567" },
    { code: "+44", name: "Royaume-Uni", flag: "🇬🇧", placeholder: "7911 123456" },
    { code: "+49", name: "Allemagne", flag: "🇩🇪", placeholder: "1512 3456789" },
    { code: "+39", name: "Italie", flag: "🇮🇹", placeholder: "312 345 6789" },
    { code: "+34", name: "Espagne", flag: "🇪🇸", placeholder: "612 34 56 78" },
    { code: "+351", name: "Portugal", flag: "🇵🇹", placeholder: "912 345 678" },
    { code: "+31", name: "Pays-Bas", flag: "🇳🇱", placeholder: "6 12345678" },
    { code: "+43", name: "Autriche", flag: "🇦🇹", placeholder: "664 123456" },
    { code: "+45", name: "Danemark", flag: "🇩🇰", placeholder: "20 12 34 56" },
    { code: "+46", name: "Suède", flag: "🇸🇪", placeholder: "70-123 45 67" },
    { code: "+47", name: "Norvège", flag: "🇳🇴", placeholder: "406 12 345" },
    { code: "+358", name: "Finlande", flag: "🇫🇮", placeholder: "50 123 4567" },
    { code: "+55", name: "Brésil", flag: "🇧🇷", placeholder: "(11) 99999-9999" },
    { code: "+52", name: "Mexique", flag: "🇲🇽", placeholder: "55 1234 5678" },
    { code: "+54", name: "Argentine", flag: "🇦🇷", placeholder: "11 1234-5678" },
    { code: "+56", name: "Chili", flag: "🇨🇱", placeholder: "9 1234 5678" },
    { code: "+57", name: "Colombie", flag: "🇨🇴", placeholder: "300 1234567" },
    { code: "+51", name: "Pérou", flag: "🇵🇪", placeholder: "912 345 678" },
    { code: "+81", name: "Japon", flag: "🇯🇵", placeholder: "90-1234-5678" },
    { code: "+82", name: "Corée du Sud", flag: "🇰🇷", placeholder: "10-1234-5678" },
    { code: "+86", name: "Chine", flag: "🇨🇳", placeholder: "138 0013 8000" },
    { code: "+91", name: "Inde", flag: "🇮🇳", placeholder: "81234 56789" },
    { code: "+61", name: "Australie", flag: "🇦🇺", placeholder: "412 345 678" },
    { code: "+64", name: "Nouvelle-Zélande", flag: "🇳🇿", placeholder: "21 123 4567" },
    { code: "+27", name: "Afrique du Sud", flag: "🇿🇦", placeholder: "71 123 4567" },
    { code: "+20", name: "Égypte", flag: "🇪🇬", placeholder: "100 123 4567" },
    { code: "+234", name: "Nigeria", flag: "🇳🇬", placeholder: "802 123 4567" },
    { code: "+254", name: "Kenya", flag: "🇰🇪", placeholder: "712 123456" },
    { code: "+971", name: "Émirats arabes unis", flag: "🇦🇪", placeholder: "50 123 4567" },
    { code: "+966", name: "Arabie saoudite", flag: "🇸🇦", placeholder: "50 123 4567" },
    { code: "+90", name: "Turquie", flag: "🇹🇷", placeholder: "501 234 56 78" },
    { code: "+7", name: "Russie", flag: "🇷🇺", placeholder: "912 345-67-89" },
    { code: "+380", name: "Ukraine", flag: "🇺🇦", placeholder: "50 123 4567" },
    { code: "+48", name: "Pologne", flag: "🇵🇱", placeholder: "512 345 678" },
  ]

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) || country.code.includes(countrySearch),
  )

  // Hook de géolocalisation
  const { city, loading: geoLoading, error: geoError } = useGeolocation()

  // Codes d'effet matrice
  const matrixCodes = [
    "4bda7c",
    "x1f801",
    "uSr9ub",
    "r31sw",
    "3cqvt",
    "ebwvi",
    "4qd1tu",
    "str5y4",
    "ect2So",
    "xfnpBj",
    "kqjJu",
    "2v46yn",
    "q619ma",
    "wdtqdo",
    "14mkee",
    "pbb3eu",
    "vbncg8",
    "begaSh",
    "7rq",
    "dcboeu",
    "keyxs",
    "3Qehu",
    "N8135s",
    "nx794n",
    "11aqSi",
    "zBcpp",
    "s1xcBm",
    "u91xnm",
    "1s7mec",
    "Y8fmf",
    "11masu",
    "ye1f2t",
  ]

  // Étapes de progression pour la barre de progression globale
  const getProgressSteps = () => {
    const steps = [
      {
        id: "form",
        label: "Config",
        fullLabel: "Configuration",
        mobileLabel: "Config",
        completed: ["form", "verification", "preliminary", "generating", "result", "offer"].includes(currentStep),
      },
      {
        id: "verification",
        label: "Vérif",
        fullLabel: "Vérification",
        mobileLabel: "Vérif",
        completed: ["verification", "preliminary", "generating", "result", "offer"].includes(currentStep),
      },
      {
        id: "preliminary",
        label: "Résultat",
        fullLabel: "Résultat",
        mobileLabel: "Résultat",
        completed: ["preliminary", "generating", "result", "offer"].includes(currentStep),
      },
      {
        id: "generating",
        label: "Rapport",
        fullLabel: "Rapport",
        mobileLabel: "Rapport",
        completed: ["generating", "result", "offer"].includes(currentStep),
      },
      {
        id: "offer",
        label: "Débloc",
        fullLabel: "Déblocage",
        mobileLabel: "Accès",
        completed: currentStep === "offer",
      },
    ]
    return steps
  }

  // Compte à rebours du timer
  useEffect(() => {
    if (currentStep === "result" || currentStep === "offer") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep])

  // Progression de vérification avec messages dynamiques
  useEffect(() => {
    if (currentStep === "verification") {
      const messages = [
        { progress: 0, message: "Connexion aux serveurs Tinder..." },
        { progress: 15, message: "Accès aux informations de profil..." },
        { progress: 30, message: "Décryptage des données d'activité..." },
        { progress: 45, message: "Localisation des coordonnées géographiques..." },
        { progress: 60, message: "Recoupement avec les registres globaux..." },
        { progress: 75, message: "Analyse des modèles de comportement..." },
        { progress: 90, message: "Compilation des informations confidentielles..." },
        { progress: 100, message: "Analyse préliminaire terminée !" },
      ]

      const interval = setInterval(() => {
        setVerificationProgress((prev) => {
          const newProgress = prev + Math.random() * 8 + 2

          const currentMessage = messages.find((m) => newProgress >= m.progress && newProgress < m.progress + 25)
          if (currentMessage) {
            setVerificationMessage(currentMessage.message)
          }

          if (newProgress >= 100) {
            setTimeout(() => setCurrentStep("preliminary"), 1000)
            return 100
          }
          return Math.min(newProgress, 100)
        })
      }, 400)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Progression de génération de rapport (30 secondes) avec intégration de géolocalisation
  useEffect(() => {
    if (currentStep === "generating") {
      const baseMessages = [
        { progress: 0, message: "Analyse des photos de profil..." },
        { progress: 20, message: "Traitement de l'historique des messages..." },
        { progress: 40, message: "Vérification des dernières localisations..." },
        { progress: 60, message: "Compilation des données d'activité..." },
        { progress: 80, message: "Chiffrement des informations sensibles..." },
        { progress: 95, message: "Finalisation du rapport complet..." },
        { progress: 100, message: "Rapport généré avec succès !" },
      ]

      // Ajouter un message spécifique à la géolocalisation si la ville est disponible
      const messages = city
        ? [
            ...baseMessages.slice(0, 2),
            { progress: 30, message: `Analyse des activités récentes dans la région de ${city}...` },
            ...baseMessages.slice(2),
          ]
        : baseMessages

      const interval = setInterval(() => {
        setGeneratingProgress((prev) => {
          const newProgress = prev + 100 / 75

          const currentMessage = messages.find((m) => newProgress >= m.progress && newProgress < m.progress + 20)
          if (currentMessage) {
            setGeneratingMessage(currentMessage.message)
          }

          if (newProgress >= 100) {
            setTimeout(() => setCurrentStep("result"), 1000)
            return 100
          }
          return Math.min(newProgress, 100)
        })
      }, 400)
      return () => clearInterval(interval)
    }
  }, [currentStep, city])

  // Effet de preuve de vente mis à jour - inclut maintenant l'étape de génération
  useEffect(() => {
    if (currentStep === "generating" || currentStep === "result" || currentStep === "offer") {
      const showProof = () => {
        if (Math.random() < 0.7) {
          setShowSalesProof(true)
          setTimeout(() => setShowSalesProof(false), 6000)
        }
      }

      const initialTimeout = setTimeout(showProof, 5000)
      const interval = setInterval(showProof, 25000)

      return () => {
        clearTimeout(initialTimeout)
        clearInterval(interval)
      }
    }
  }, [currentStep])

  const fetchWhatsAppPhoto = async (phone: string) => {
    if (phone.length < 10) return

    setIsLoadingPhoto(true)
    setPhotoError("")

    try {
      const response = await fetch("/api/whatsapp-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.is_photo_private) {
          setProfilePhoto(
            "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
          )
          setIsPhotoPrivate(true)
        } else {
          setProfilePhoto(data.result)
          setIsPhotoPrivate(false)
        }
      } else {
        setProfilePhoto(
          "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
        )
        setIsPhotoPrivate(true)
        setPhotoError("Impossible de charger la photo")
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de photo:", error)
      setProfilePhoto(
        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
      )
      setIsPhotoPrivate(true)
      setPhotoError("Erreur lors du chargement de la photo")
    } finally {
      setIsLoadingPhoto(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    // S'assurer que la valeur commence par le code pays sélectionné
    let formattedValue = value
    if (!value.startsWith(selectedCountry.code)) {
      // Si l'utilisateur tape un numéro sans code pays, le préfixer
      if (value && !value.startsWith("+")) {
        formattedValue = selectedCountry.code + " " + value
      } else if (value.startsWith("+") && !value.startsWith(selectedCountry.code)) {
        // L'utilisateur a tapé un code pays différent, le garder tel quel
        formattedValue = value
      } else {
        formattedValue = selectedCountry.code + " " + value.replace(selectedCountry.code, "").trim()
      }
    }

    setPhoneNumber(formattedValue)

    // Extraire seulement les chiffres pour l'appel API
    const cleanPhone = formattedValue.replace(/[^0-9]/g, "")
    if (cleanPhone.length >= 10) {
      fetchWhatsAppPhoto(cleanPhone)
    } else {
      setProfilePhoto(null)
      setIsPhotoPrivate(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCountryDropdown) {
        const target = event.target as Element
        if (!target.closest(".relative")) {
          setShowCountryDropdown(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showCountryDropdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Fonctions du carrousel
  const blockedImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%2016%20de%20jun.%20de%202025%2C%2013_13_25-pmZr6jZA37litzPJj8wNrpnkp0rvw7.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%2016%20de%20jun.%20de%202025%2C%2013_00_31-dvWrjTNfk1GBf9V0QzQ1AkwSwyLJtc.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%2016%20de%20jun.%20de%202025%2C%2013_07_30-yxXklpz3bQ3P5v6vrD3e0vfNJM8qay.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%2016%20de%20jun.%20de%202025%2C%2013_09_25-0Fi38oBqj5XfdYiVY73fUzmlAvv7N5.png",
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % blockedImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + blockedImages.length) % blockedImages.length)
  }

  // Auto-scroll du carrousel
  useEffect(() => {
    if (currentStep === "result") {
      const interval = setInterval(nextSlide, 4000)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  const canVerify = phoneNumber.length >= 10 && selectedGender && profilePhoto && lastTinderUse && cityChange

  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Barre de progression globale - Optimisée pour mobile */}
      {currentStep !== "landing" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="stepper-container overflow-x-auto px-3 py-3">
            <div className="flex items-center gap-2 min-w-max">
              {getProgressSteps().map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="stepper-step flex items-center gap-2 min-w-[80px] sm:min-w-[100px]">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                        step.completed
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? "✓" : index + 1}
                    </div>
                    <span
                      className={`font-medium transition-colors duration-300 text-xs sm:text-sm whitespace-nowrap ${
                        step.completed ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      <span className="block sm:hidden">{step.mobileLabel}</span>
                      <span className="hidden sm:block">{step.fullLabel}</span>
                    </span>
                  </div>
                  {index < getProgressSteps().length - 1 && (
                    <div className="w-6 sm:w-8 h-px bg-gray-300 mx-2 sm:mx-3 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popup de preuve de vente - Preuve sociale dynamique */}
      <AnimatePresence>
        {showSalesProof && (currentStep === "generating" || currentStep === "result" || currentStep === "offer") && (
          <SalesProofPopup show={showSalesProof} onClose={() => setShowSalesProof(false)} />
        )}
      </AnimatePresence>

      <div className={currentStep !== "landing" ? "pt-16 sm:pt-20" : ""}>
        <AnimatePresence mode="wait">
          {/* Page d'accueil - Optimisée pour mobile */}
          {currentStep === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-gradient-to-br from-[#1C2833] to-[#6C63FF] relative overflow-hidden"
            >
              {/* Arrière-plan Matrix - Réduit pour les performances mobiles */}
              <div className="absolute inset-0 opacity-10 sm:opacity-20">
                {matrixCodes.slice(0, 15).map((code, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-green-400 text-xs font-mono"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  >
                    {code}
                  </motion.div>
                ))}
              </div>

              {/* Contenu */}
              <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
                {/* En-tête */}
                <div className="text-center mb-12 sm:mb-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#FF0066] to-[#FF3333] rounded-2xl mb-6 sm:mb-8 shadow-2xl"
                  >
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 px-2 leading-tight"
                  >
                    Il/Elle dit ne plus utiliser Tinder…
                    <br />
                    <span className="text-[#FF3B30] text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold">
                      Vraiment ?
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-[#CCCCCC] mb-6 text-base sm:text-lg md:text-xl px-4 max-w-3xl mx-auto font-medium"
                  >
                    Technologie de suivi des applications de rencontre. 100% confidentiel.
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-flex items-center gap-2 bg-green-600/20 text-green-300 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm mt-4 border border-green-500/30"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Système Mis à Jour - Juin 2025</span>
                  </motion.div>
                </div>

                {/* Fonctionnalités - Optimisées pour mobile */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="max-w-2xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12 px-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#00FF99]" />
                    <span className="font-semibold text-sm sm:text-base">✅ ANALYSE D'ACTIVITÉ RÉCENTE</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#00FF99]" />
                    <span className="font-semibold text-sm sm:text-base">✅ LOCALISATIONS DE CONNEXION SUSPECTES</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#00FF99]" />
                    <span className="font-semibold text-sm sm:text-base">✅ PHOTOS ET CONVERSATIONS RÉCENTES</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#00FF99]" />
                    <span className="font-semibold text-sm sm:text-base">
                      ✅ 100% CONFIDENTIEL - IL/ELLE NE SAURA JAMAIS
                    </span>
                  </div>
                </motion.div>

                {/* CTA - Optimisé pour mobile */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-center mb-12 sm:mb-16 px-4"
                >
                  <Button
                    onClick={() => setCurrentStep("form")}
                    className="bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white font-bold py-4 sm:py-6 px-8 sm:px-12 text-base sm:text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 w-full max-w-md touch-manipulation"
                  >
                    🚨 COMMENCER LA DÉTECTION CONFIDENTIELLE
                  </Button>
                  <p className="text-sm text-gray-300 mt-4 font-medium">
                    Technologie en temps réel. Secret total garanti.
                  </p>
                </motion.div>
              </div>

              {/* Section du bas - Optimisée pour mobile */}
              <div className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#333333] mb-2">CE QUE VOUS ALLEZ</h2>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF0066] to-[#FF3333] mb-2">
                      DÉCOUVRIR SUR VOTRE
                    </h3>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF0066] to-[#FF3333]">
                      PARTENAIRE
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12">
                    <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                      </div>
                      <h4 className="font-bold text-[#333333] mb-2 text-sm sm:text-base">ACTIVITÉ RÉCENTE</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Voir quand il/elle a utilisé Tinder pour la dernière fois
                      </p>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                      </div>
                      <h4 className="font-bold text-[#333333] mb-2 text-sm sm:text-base">LOCALISATION EXACTE</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Où il/elle programme le plus de rendez-vous</p>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                      </div>
                      <h4 className="font-bold text-[#333333] mb-2 text-sm sm:text-base">PHOTOS INTIMES</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Toutes les photos qu'il/elle montre</p>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                      </div>
                      <h4 className="font-bold text-[#333333] mb-2 text-sm sm:text-base">CONVERSATIONS EXPLICITES</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Ce qu'il/elle dit aux autres</p>
                    </div>
                  </div>

                  {/* Section Témoignages - Optimisée pour mobile avec vrais avatars */}
                  {/* Section Témoignages - Authenticité renforcée */}
                  <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#333333] mb-6 sm:mb-8 px-2">
                      NE RESTEZ PAS DANS LE DOUTE – VOYEZ CE QUE D'AUTRES ONT DÉCOUVERT
                    </h3>

                    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 mb-6 sm:mb-8">
                      {/* Témoignage d'Anna */}
                      <div className="testimonial-card bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-start gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                          alt="Photo d'Anna"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                          }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="mb-2">
                            <p className="font-bold text-[#333333] text-base sm:text-lg">Anna</p>
                            <p className="text-xs sm:text-sm text-green-600 font-medium">✓ Utilisatrice Vérifiée</p>
                          </div>
                          <div className="mb-3">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 float-left mr-1 mt-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                            </svg>
                            <p className="text-[#444444] text-base sm:text-lg leading-relaxed font-normal">
                              Je pensais qu'il avait désinstallé Tinder... Mais après l'analyse, j'ai vu qu'il likait
                              encore les profils d'autres femmes. Ça a été un choc... Mais au moins maintenant je
                              connais la vérité.
                            </p>
                          </div>
                          <div className="flex items-center text-[#FFD700] text-sm sm:text-base gap-1">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                      </div>

                      {/* Témoignage de Charles */}
                      <div className="testimonial-card bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-start gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                          alt="Photo de Charles"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                          }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="mb-2">
                            <p className="font-bold text-[#333333] text-base sm:text-lg">Charles</p>
                            <p className="text-xs sm:text-sm text-blue-600 font-medium">
                              Analyse effectuée en juin 2025
                            </p>
                          </div>
                          <div className="mb-3">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 float-left mr-1 mt-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                            </svg>
                            <p className="text-[#444444] text-base sm:text-lg leading-relaxed font-normal">
                              J'avais des soupçons, mais jamais de certitude... Quand j'ai vu le rapport montrant les
                              conversations récentes, ça m'a frappé. Je ne voulais pas y croire... Mais les données ne
                              mentent pas.
                            </p>
                          </div>
                          <div className="flex items-center text-[#FFD700] text-sm sm:text-base gap-1">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                      </div>

                      {/* Témoignage de Félicité */}
                      <div className="testimonial-card bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-start gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
                          alt="Photo de Félicité"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                          }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="mb-2">
                            <p className="font-bold text-[#333333] text-base sm:text-lg">Félicité</p>
                            <p className="text-xs sm:text-sm text-green-600 font-medium">✓ Utilisatrice Vérifiée</p>
                          </div>
                          <div className="mb-3">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 float-left mr-1 mt-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                            </svg>
                            <p className="text-[#444444] text-base sm:text-lg leading-relaxed font-normal">
                              J'ai toujours eu confiance en lui... Jusqu'à ce que je commence à remarquer des
                              changements. J'ai fait l'analyse sur un coup de tête... Et ce que j'ai trouvé m'a laissée
                              sans voix. Mais je préfère connaître la vérité que vivre dans le doute.
                            </p>
                          </div>
                          <div className="flex items-center text-[#FFD700] text-sm sm:text-base gap-1">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton CTA unique */}
                    <Button
                      onClick={() => setCurrentStep("form")}
                      className="bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full max-w-sm touch-manipulation"
                    >
                      🔎 JE VEUX CONNAÎTRE LA VÉRITÉ
                    </Button>
                  </div>

                  {/* Avis de confidentialité du bas */}
                  <div className="text-center px-4">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-2 font-medium">
                      <Shield className="w-4 h-4" />
                      100% confidentiel - il/elle ne saura JAMAIS que vous avez vérifié
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Formulaire - Optimisé pour mobile */}
          {currentStep === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-[#6C63FF] relative overflow-hidden"
            >
              {/* Points flottants - Réduits pour mobile */}
              <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-lg">
                  {/* En-tête */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                      <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-[#6C63FF]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                      📡 CONFIGURATION DES PARAMÈTRES DE RECHERCHE
                    </h1>
                    <p className="text-gray-200 text-sm sm:text-base px-4 leading-relaxed">
                      Pour assurer une analyse précise du profil, nous avons besoin de quelques informations techniques
                      sur le numéro à vérifier :
                    </p>
                  </div>

                  {/* Formulaire */}
                  <Card className="bg-white rounded-2xl shadow-lg border-0">
                    <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                      {/* Numéro de téléphone */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-[#333333] mb-2 sm:mb-3">
                          Numéro WhatsApp
                        </label>
                        <div className="flex gap-2 sm:gap-3">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border text-gray-600 flex-shrink-0 font-medium text-sm sm:text-base flex items-center gap-2 hover:bg-gray-200 transition-colors duration-200 min-w-[80px] sm:min-w-[90px]"
                            >
                              <span className="text-lg">{selectedCountry.flag}</span>
                              <span>{selectedCountry.code}</span>
                              <svg
                                className="w-3 h-3 sm:w-4 sm:h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showCountryDropdown && (
                              <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                <div className="p-2">
                                  <input
                                    type="text"
                                    placeholder="Rechercher pays ou code..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {filteredCountries.map((country) => (
                                    <button
                                      key={country.code}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(country)
                                        setShowCountryDropdown(false)
                                        setCountrySearch("")
                                        // Mettre à jour le numéro de téléphone avec le nouveau code pays
                                        const cleanNumber = phoneNumber.replace(/^\+\d+/, "")
                                        const newNumber = country.code + cleanNumber
                                        handlePhoneChange(newNumber)
                                      }}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                                    >
                                      <span className="text-lg">{country.flag}</span>
                                      <span className="font-medium">{country.code}</span>
                                      <span className="text-gray-600 truncate">{country.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Input
                            type="tel"
                            placeholder={`Numéro (ex: ${selectedCountry.placeholder})`}
                            value={phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value
                              // Auto-détecter le code pays si l'utilisateur le tape
                              if (value.startsWith("+")) {
                                const enteredCode = value.split(" ")[0]
                                const matchedCountry = countries.find((c) => c.code === enteredCode)
                                if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
                                  setSelectedCountry(matchedCountry)
                                }
                              }
                              handlePhoneChange(value)
                            }}
                            className="flex-1 rounded-xl border-2 border-gray-200 focus:border-[#6C63FF] transition-colors duration-200 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
                          Entrez le numéro qu'il/elle utilise sur WhatsApp
                        </p>
                      </div>

                      {/* Affichage de la photo */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-[#333333] mb-2 sm:mb-3">
                          Photo de profil détectée
                        </label>
                        <div className="text-center">
                          {isLoadingPhoto ? (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mx-auto">
                              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#6C63FF]"></div>
                            </div>
                          ) : profilePhoto ? (
                            <div className="relative inline-block">
                              <img
                                src={profilePhoto || "/placeholder.svg"}
                                alt="Profil"
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-green-500 shadow-lg"
                              />
                              {isPhotoPrivate && (
                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm shadow-lg">
                                  🔒
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mx-auto">
                              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                            </div>
                          )}

                          {photoError && (
                            <p className="text-xs sm:text-sm text-red-500 mt-3 font-medium">{photoError}</p>
                          )}

                          {profilePhoto && !isLoadingPhoto && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-3 font-medium">
                              {isPhotoPrivate ? "Photo privée détectée" : "Photo publique trouvée"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sélection du genre */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-[#333333] mb-3 sm:mb-4">
                          Genre
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {[
                            { id: "masculin", label: "Homme", icon: "👨", color: "blue" },
                            { id: "feminin", label: "Femme", icon: "👩", color: "pink" },
                            { id: "non-binaire", label: "Non-binaire", icon: "👤", color: "purple" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setSelectedGender(option.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg touch-manipulation ${
                                selectedGender === option.id
                                  ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{option.icon}</div>
                              <div className="text-xs sm:text-sm font-semibold">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dernière utilisation de Tinder */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-[#333333] mb-3 sm:mb-4">
                          Dernière fois que cette personne a pu utiliser Tinder :
                        </label>
                        <div className="space-y-2 sm:space-y-3">
                          {[
                            { id: "7-jours", label: "Dans les 7 derniers jours" },
                            { id: "30-jours", label: "Dans les 30 derniers jours" },
                            { id: "1-mois", label: "Plus d'1 mois" },
                            { id: "pas-sur", label: "Je ne suis pas sûr(e)" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setLastTinderUse(option.id)}
                              className={`w-full p-3 sm:p-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-lg touch-manipulation ${
                                lastTinderUse === option.id
                                  ? "border-blue-500 bg-blue-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${
                                    lastTinderUse === option.id ? "bg-blue-500 border-blue-500" : "border-gray-300"
                                  }`}
                                />
                                <span className="font-medium text-sm sm:text-base">{option.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Changement de ville */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-[#333333] mb-3 sm:mb-4">
                          Cette personne a-t-elle déménagé récemment ?
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {[
                            { id: "oui", label: "Oui" },
                            { id: "non", label: "Non" },
                            { id: "ne-sais-pas", label: "Je ne sais pas" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setCityChange(option.id)}
                              className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg touch-manipulation ${
                                cityChange === option.id
                                  ? "border-green-500 bg-green-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="font-semibold text-sm sm:text-base">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bouton de soumission */}
                      <Button
                        onClick={() => setCurrentStep("verification")}
                        disabled={!canVerify}
                        className={`w-full py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl transition-all duration-300 touch-manipulation ${
                          canVerify
                            ? "bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white shadow-xl hover:shadow-2xl transform hover:scale-105"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        🔎 COMMENCER L'ANALYSE DU PROFIL
                      </Button>

                      <p className="text-xs sm:text-sm text-gray-500 text-center flex items-center justify-center gap-2 font-medium">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />🔒 Données chiffrées selon les normes
                        internationales de confidentialité
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vérification - Optimisée pour mobile */}
          {currentStep === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black"
            >
              {/* Arrière-plan Matrix - Réduit pour mobile */}
              <div className="absolute inset-0">
                {matrixCodes.slice(0, 15).map((code, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-[#00FF00] text-sm font-mono opacity-80"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  >
                    {code}
                  </motion.div>
                ))}
              </div>

              {/* Carte de vérification */}
              <div className="relative z-10 w-full max-w-lg mx-auto px-4">
                <Card className="bg-gray-900 border-2 border-[#00FF00] rounded-2xl shadow-2xl">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="mb-6 sm:mb-8">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto || "/placeholder.svg"}
                          alt="Profil"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto border-4 border-[#00FF00] shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00FF00] rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                          <User className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                      VÉRIFICATION EN COURS...
                    </h2>
                    <p className="text-[#00FF00] mb-6 sm:mb-8 text-sm sm:text-base font-medium px-2">
                      {verificationMessage}
                    </p>

                    <div className="mb-4 sm:mb-6">
                      <Progress
                        value={verificationProgress}
                        className="h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden"
                      />
                    </div>

                    <p className="text-white text-lg sm:text-xl font-bold mb-6 sm:mb-8">
                      {Math.round(verificationProgress)}% terminé
                    </p>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#00FF00] text-sm sm:text-base font-medium">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Connexion sécurisée et chiffrée</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Résultats préliminaires - Optimisés pour mobile */}
          {currentStep === "preliminary" && (
            <motion.div
              key="preliminary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#F9F9F9]"
            >
              {/* Arrière-plan Matrix - Réduit pour mobile */}
              <div className="absolute inset-0 opacity-30">
                {matrixCodes.slice(0, 10).map((code, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-[#00FF00] text-xs font-mono"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  >
                    {code}
                  </motion.div>
                ))}
              </div>

              {/* Carte préliminaire */}
              <div className="relative z-10 w-full max-w-lg mx-auto px-4">
                <Card className="bg-white border-2 border-green-500 rounded-2xl shadow-2xl">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="mb-6 sm:mb-8"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl">
                        <CheckCircle className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                      </div>
                    </motion.div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#333333] mb-4 sm:mb-6">
                      🟢 Analyse Préliminaire Terminée !
                    </h2>
                    <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
                      Le système a identifié{" "}
                      <span className="text-[#D8000C] font-bold">des signes d'activité suspecte</span> liés au numéro
                      fourni.
                    </p>

                    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                      <p className="text-yellow-800 text-sm sm:text-base font-medium">
                        👉 <strong>Étape suivante :</strong> Génération du rapport complet des photos, conversations et
                        localisations...
                      </p>
                    </div>

                    <Button
                      onClick={() => setCurrentStep("generating")}
                      className="w-full bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white font-bold py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
                    >
                      📊 GÉNÉRER LE RAPPORT COMPLET
                    </Button>

                    <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 text-green-600 text-sm sm:text-base font-medium">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Traitement sécurisé et anonyme</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Génération du rapport - Optimisée pour mobile */}
          {currentStep === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center"
            >
              {/* Arrière-plan Matrix - Réduit pour mobile */}
              <div className="absolute inset-0">
                {matrixCodes.slice(0, 15).map((code, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-[#00FF00] text-sm font-mono opacity-80"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  >
                    {code}
                  </motion.div>
                ))}
              </div>

              {/* Carte de génération */}
              <div className="relative z-10 w-full max-w-lg mx-auto px-4">
                <Card className="bg-gray-900 border-2 border-blue-500 rounded-2xl shadow-2xl">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="mb-6 sm:mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl"
                      >
                        <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </motion.div>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                      CONSTRUCTION DU RAPPORT...
                    </h2>
                    <p className="text-blue-400 mb-6 sm:mb-8 text-sm sm:text-base font-medium px-2">
                      {generatingMessage}
                    </p>

                    <div className="mb-4 sm:mb-6">
                      <Progress
                        value={generatingProgress}
                        className="h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden"
                      />
                    </div>

                    <p className="text-white text-lg sm:text-xl font-bold mb-6 sm:mb-8">
                      {Math.round(generatingProgress)}% terminé
                    </p>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">Traitement avancé en cours</span>
                      </div>
                      <p className="font-medium">Temps estimé : {Math.ceil((100 - generatingProgress) / 3)} secondes</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Résultat - Optimisé pour mobile */}
          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-4 sm:py-8 bg-[#FFE6E6]"
            >
              <div className="container mx-auto px-4 max-w-lg">
                {/* Alerte */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#FF3B30] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl relative mb-4 sm:mb-6 shadow-2xl"
                  role="alert"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse flex-shrink-0" />
                    <div>
                      <strong className="font-bold text-base sm:text-lg">PROFIL TROUVÉ !</strong>
                      <p className="text-xs sm:text-sm opacity-90">Il/Elle est actif/active sur Tinder.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Avertissement */}
                <Card className="bg-[#FF3B30] text-white mb-4 sm:mb-6 rounded-2xl border-0 shadow-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-pulse" />
                      <span className="font-bold text-base sm:text-lg">ATTENTION : PROFIL ACTIF TROUVÉ !</span>
                    </div>
                    <p className="text-sm opacity-90">
                      Nous confirmons que ce numéro est lié à un profil Tinder ACTIF.
                    </p>
                    {/* Info de géolocalisation */}
                    {city && (
                      <p className="text-xs sm:text-sm opacity-90 mt-2 font-medium">
                        Derniers enregistrements d'utilisation détectés à{" "}
                        <span className="text-yellow-300 font-bold underline">{city}</span>.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Photos bloquées */}
                <Card className="bg-gray-900 text-white mb-4 sm:mb-6 rounded-2xl border-0 shadow-xl">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 text-xs">
                      <span className="bg-[#FF3B30] px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold">
                        EN LIGNE MAINTENANT !
                      </span>
                      <span className="bg-[#FFA500] text-black px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold">
                        ESSAI GRATUIT
                      </span>
                      <span className="font-bold">1/4</span>
                    </div>

                    <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-gray-400" />
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">PHOTOS CENSURÉES</h3>

                    {/* Carrousel d'images bloquées */}
                    <div className="relative mb-4 sm:mb-6 max-w-xs mx-auto">
                      <div className="overflow-hidden rounded-2xl bg-gray-800 border-2 border-gray-600">
                        <div
                          className="flex transition-transform duration-300 ease-in-out"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {blockedImages.map((image, index) => (
                            <div key={index} className="min-w-full relative">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Photo bloquée ${index + 1}`}
                                className="w-full h-48 sm:h-56 object-cover"
                                style={{ filter: "blur(12px) brightness(0.7)" }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="text-center">
                                  <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white mx-auto mb-2 opacity-80" />
                                  <p className="text-white text-xs font-bold opacity-80">BLOQUÉ</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Flèches de navigation */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Indicateurs de slide */}
                      <div className="flex justify-center mt-3 space-x-2">
                        {blockedImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentSlide ? "bg-white" : "bg-gray-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => window.open("https://global.mundpay.com/qggubavs2v?affh=u6ngy61pja", "_blank")}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
                    >
                      👁️ VOIR LES PHOTOS COMPLÈTES MAINTENANT
                    </Button>
                  </CardContent>
                </Card>

                {/* Timer avec tension renforcée */}
                <Card
                  className={`text-white mb-4 sm:mb-6 rounded-2xl border-0 shadow-xl ${
                    timeLeft <= 120 ? "bg-[#FFA500] animate-pulse" : "bg-[#FF3B30]"
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-bounce" />
                      <span className="font-bold text-base sm:text-lg">LE RAPPORT SERA SUPPRIMÉ DANS :</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{formatTime(timeLeft)}</div>
                    <div className="space-y-1 sm:space-y-2 text-xs opacity-90">
                      <p>
                        Après expiration du délai, les données seront définitivement supprimées pour des raisons de
                        confidentialité.
                      </p>
                      <p className="font-bold text-yellow-200">Cet accès ne pourra pas être récupéré plus tard.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Card className="rounded-2xl border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#FF0066]">6</div>
                      <div className="text-[0.6rem] sm:text-xs text-gray-600 font-medium">MATCHS (7 JOURS)</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#FF0066]">30</div>
                      <div className="text-[0.6rem] sm:text-xs text-gray-600 font-medium">LIKES (7 JOURS)</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-[#FF0066]">4</div>
                      <div className="text-[0.6rem] sm:text-xs text-gray-600 font-medium">JOURS ACTIFS</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activité */}
                <Card className="mb-4 sm:mb-6 rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF0066] flex-shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-[#333333]">ACTIVITÉ RÉCENTE</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-200">
                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF0066] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#333333]">Matché avec 6 personnes</div>
                          <div className="text-xs text-gray-600">7 derniers jours • Très actif/active</div>
                        </div>
                        <span className="bg-[#FF3B30] text-white text-[0.6rem] px-2 py-1 rounded-full font-bold flex-shrink-0">
                          NOUVEAU
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-200">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFA500] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#333333]">A reçu 30 likes</div>
                          <div className="text-xs text-gray-600">7 derniers jours • Profil très populaire</div>
                        </div>
                        <span className="bg-[#FFA500] text-white text-[0.6rem] px-2 py-1 rounded-full font-bold flex-shrink-0">
                          ACTIF
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-2xl border border-red-200">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-[#D8000C] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#333333]">
                            A utilisé Tinder dans un nouvel endroit
                          </div>
                          <div className="text-xs text-gray-600">Aujourd'hui à 19h35 • Suspect !</div>
                        </div>
                        <span className="bg-[#D8000C] text-white text-[0.6rem] px-2 py-1 rounded-full font-bold flex-shrink-0">
                          ALERTE
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-200">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#333333]">A envoyé 15 messages</div>
                          <div className="text-xs text-gray-600">Aujourd'hui • Discute activement</div>
                        </div>
                        <span className="bg-purple-500 text-white text-[0.6rem] px-2 py-1 rounded-full font-bold flex-shrink-0">
                          AUJOURD'HUI
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA - Offre */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-[#333333] mb-2 sm:mb-3">
                    DÉBLOQUER LE RAPPORT COMPLET
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                    Voir les photos, conversations et localisation exacte du profil.
                  </p>
                  <Button
                    onClick={() => window.open("https://global.mundpay.com/qggubavs2v?affh=u6ngy61pja", "_blank")}
                    className="bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full touch-manipulation"
                  >
                    🔓 DÉBLOQUER LE RAPPORT MAINTENANT
                  </Button>
                  <p className="text-xs text-gray-500 mt-4 font-medium">Offre à durée limitée uniquement.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Offre - Optimisée pour mobile */}
          {currentStep === "offer" && (
            <motion.div
              key="offer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-gradient-to-br from-[#FF3B30] to-[#FF0066] relative overflow-hidden"
            >
              {/* Cœurs flottants - Réduits pour mobile */}
              <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-white rounded-full opacity-20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-lg">
                  {/* En-tête */}
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                      <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF0066]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                      🔒 DÉBLOQUER LE RAPPORT COMPLET
                    </h1>
                    <p className="text-gray-200 text-sm sm:text-base px-4 leading-relaxed">
                      Voir les photos, conversations et localisation exacte du profil.
                    </p>
                  </div>

                  {/* Carte d'offre */}
                  <Card className="bg-white rounded-2xl shadow-lg border-0">
                    <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                      {/* Prix */}
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-bold text-[#FF0066] mb-2 sm:mb-3">47,00 €</div>
                        <p className="text-sm sm:text-base text-gray-500 font-medium">
                          Accès unique et à vie au rapport complet.
                        </p>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base text-[#333333]">
                            Voir toutes les photos de profil (y compris les privées)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base text-[#333333]">
                            Accéder aux conversations récentes (et ce qu'il/elle dit)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base text-[#333333]">
                            Découvrir la localisation exacte (et où il/elle programme des rendez-vous)
                          </span>
                        </div>
                      </div>

                      {/* Bouton */}
                      <Button
                        onClick={() => window.open("https://global.mundpay.com/qggubavs2v?affh=u6ngy61pja", "_blank")}
                        className="w-full bg-gradient-to-r from-[#FF0066] to-[#FF3333] hover:from-[#FF0066] hover:to-[#FF3333] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
                      >
                        🔓 DÉBLOQUER LE RAPPORT MAINTENANT
                      </Button>

                      {/* Timer */}
                      <div className="text-center mt-6 sm:mt-8">
                        <p className="text-sm sm:text-base text-gray-500 font-medium mb-2 sm:mb-3">
                          Offre à durée limitée :
                        </p>
                        <div className="text-2xl sm:text-3xl font-bold text-[#FF0066]">{formatTime(timeLeft)}</div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 sm:mt-3">
                          Après expiration du délai, les données seront supprimées.
                        </p>
                      </div>

                      {/* Garantie */}
                      <div className="flex items-center justify-center gap-2 sm:gap-3 text-green-600 text-sm sm:text-base font-medium mt-6 sm:mt-8">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Paiement sécurisé et garanti</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
