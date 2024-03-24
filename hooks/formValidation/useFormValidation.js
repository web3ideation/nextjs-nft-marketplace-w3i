// hooks/useFormValidation.js
import { useState } from "react"
import { validateField } from "@utils/validation"

const useFormValidation = (initialValues) => {
    const [formData, setFormData] = useState(initialValues)
    const [errors, setErrors] = useState({})

    // Validiert das gesamte Formular
    const validateForm = () => {
        let newErrors = {}
        let isValid = true

        Object.keys(formData).forEach((key) => {
            const errorMessage = validateField(key, formData[key])
            if (errorMessage) {
                newErrors[key] = errorMessage
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    // Aktualisiert den Formularwert und führt die Validierung für dieses Feld aus
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Optionale sofortige Validierung bei jeder Änderung
        const errorMessage = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: errorMessage }))
    }

    return { formData, setFormData, errors, handleChange, validateForm }
}

export default useFormValidation
