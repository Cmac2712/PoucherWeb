export type StringModifier = (str1:string, str2?:string) => string

export const displayTag:StringModifier = tag => tag.split(':')[1]

export const updateTags:StringModifier = (allTags, newTags) => {

    if (typeof allTags !== 'string') return newTags

    const update = newTags.split(',').filter(tag => {
        const val = allTags.indexOf(tag)

        if (val) return

        return tag

    }).join(',')


    return allTags + update
}