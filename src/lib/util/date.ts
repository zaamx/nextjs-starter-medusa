export const formatDateToMexicoCity = (
    date: string | Date,
    includeTime: boolean = false
) => {
    const d = new Date(date)

    if (isNaN(d.getTime())) {
        return date.toString()
    }

    const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "long",
        day: "numeric",
    }

    if (includeTime) {
        options.hour = "2-digit"
        options.minute = "2-digit"
        options.second = "2-digit"
    }

    return new Intl.DateTimeFormat("es-MX", options).format(d)
}
