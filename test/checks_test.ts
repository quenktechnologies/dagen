import * as must from 'must/register';
import { propertyCheck } from '../src/checks';

describe('propertyCheck', function() {

    it('should not crash when sum types omit variants', function() {

        must(propertyCheck({ type: 'sum' }).takeLeft().explain()).eql({
        
          variants: 'isObject'

        });

    })

})
