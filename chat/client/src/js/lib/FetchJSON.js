
//Given URL and state machine it fetches url,
// parses json and calls stateMachine methods
//
export function fetchJSON(url, stateMachine){
    setImmediate(async ()=>{
        try{
            let response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            if(!response.ok){
                console.log(`Fetch error: ${response.status}: ${response.statusText}`);
                stateMachine.handle.fetchJSONError(null, `${response.status}: ${response.statusText}`)
                return;
            }
            let parsedResponse = await response.json()

            stateMachine.handle.JSONReceived(null, parsedResponse);

        }catch (err){

            stateMachine.handle.fetchJSONError(null, err)

        }
    })

}

export function postJSON(url, stateMachine, data){
    setImmediate(async ()=>{
        try{
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(data)
            })

            if(!response.ok){
                console.log(`Fetch error: ${response.status}: ${response.statusText}`);
                stateMachine.handle.fetchJSONError(`${response.status}: ${response.statusText}`)
                return;
            }
            let parsedResponse = await response.json()

            stateMachine.handle.JSONReceived(parsedResponse);

        }catch(err){

            stateMachine.handle.fetchJSONError(err)

        }
    })
}
