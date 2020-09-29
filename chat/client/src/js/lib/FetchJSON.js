
//Given URL and state machine it fetches url,
// parses json and calls stateMachine methods
//
export async function fetchJSON(url, stateMachine){

    try{
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if(!response.ok){
            console.log(`Fetch error: ${response.status}: ${response.statusText}`);
            stateMachine.handle.fetchJSONError(`${response.status}: ${response.statusText}`)
            return;
        }
        let parsedResponse = await response.json()

        console.log("%c Calling state machine", "color: green; font-size: 15px");
        stateMachine.handle.JSONReceived(parsedResponse);

    }catch (err){
        console.log(`Fetch error: ${err}`);
        stateMachine.handle.fetchJSONError(err)

    }

}

export async function postJSON(url, stateMachine, data){
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
}
