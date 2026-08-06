module.exports = function capitalize(str) {
    let res = str[0].toUpperCase()
    for (let i = 1; i < str.length; ++i) {
        res += str[i]
    }
    return res
}
