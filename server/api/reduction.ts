import type { Reduction } from '~/types'

const customers: Reduction[] = [{
  id: 1,
  name: 'Inox10',
  pourcentage: 10,
  utiliser: 5,
},{
  id: 2,
  name: '3g4jg8',
  pourcentage: 60,
  utiliser: 10,
},{
  id: 3,
  name: 'Influenceur',
  pourcentage: 100,
  utiliser: 50,
},]

export default eventHandler(async () => {
  return customers
})
