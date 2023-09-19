function Property(target, key){
	target.constructor.propertiesToSet = target.constructor.propertiesToSet || []
	target.constructor.propertiesToSet.push(key)
}

class Test {

	// static propertiesToSet = []
	
	@Property
	count = 0

	constructor(){
		this.props = this.props ?? {}
		if(this.constructor.propertiesToSet){
			for (const key of this.constructor.propertiesToSet){
				Object.defineProperty(this, key, {
					set: value => {
						this.props[key] = value
					},
					get: () => {
						return this.props[key]
					}
				})
			}
		}
		for(const key in this.props){
			Object.defineProperty(this, key, {
				set: value => {
					this.props[key] = value
				}
			})
		}
		for(const key in this.props){
			Object.defineProperty(this, key, {
				set: () => {
					this.props[key] = value
				}
			})
		}
	}
}

class Tester extends Test {
	@Property
	count = 0
}

const tester = new Tester()
tester.count = 1
console.log(tester.count)
tester.count = 2
console.log(tester.count)