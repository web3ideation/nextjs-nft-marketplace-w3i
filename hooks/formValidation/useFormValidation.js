import { useState } from "react"
import { validateField } from "@utils/validation"

const useFormValidation = (initialValues) => {
    const [formData, setFormData] = useState(initialValues)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = Object.keys(formData).reduce((acc, key) => {
            const errorMessage = validateField(key, formData[key])
            if (errorMessage) {
                acc[key] = errorMessage
                return acc
            }
            return acc
        }, {})

        const isValid = Object.keys(newErrors).length === 0
        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        const errorMessage = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: errorMessage }))
    }

    return { formData, setFormData, errors, handleChange, validateForm }
}

export default useFormValidation
