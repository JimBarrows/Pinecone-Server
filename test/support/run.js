/**
 * Created by JimBarrows on 10/1/19.
 */


import Jasmine from 'jasmine'

let jasmine = new Jasmine()
// modify this line to point to your jasmine.json
jasmine.loadConfigFile('test/support/jasmine.json')
jasmine.execute()
