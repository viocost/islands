
//Given URL and state machine it fetches url,
// parses json and calls stateMachine methods
//
export function fetchJSON(url, stateMachine){

    setImmediate(async ()=>{
        try{
            let response = fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            if(!response.ok) stateMachine.handle.fetchJSONError(`${response.status}: ${response.statusText}`)

            let parsedResponse = await response.json()

            stasteMachine.handle.JSONReceived(parsedResponse);

        }catch (err){

            stateMachine.handle.fetchJSONError(err)
        }
    })

}
