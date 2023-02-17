export const formatJsonForFile = (n: any, indent?: string): string => {
    if (!indent) {
      indent = ''
    }
    switch(typeof n){
        default:
        case 'string':
        case 'number':
        case 'boolean':
            return JSON.stringify(n)
        case 'object':
            let o: string
            let els: string[] = []
            const ni = indent + '\t'
            if (n.length >= 0) {
            n.forEach((el: any) => {
                if (typeof el === 'function') return
                els.push(formatJsonForFile(el, indent + '\t'))
            })
            o = '[\n' + ni + els.join(',\n' + ni) + '\n' + indent + ']'
            } else {
            for (var k in n) {
                if (typeof n[k] === 'function') break
                els.push('"' + k + '": ' + formatJsonForFile(n[k],indent + '\t'))
            }
            o = '{\n' + ni + els.join(',\n' + ni) + '\n' + indent + '}'
            }
            return o
    }
  }