const urlApi = "http://localhost:3000"


const connect = async ({ key = "" }) => {
    const myHeaders = new Headers();
    myHeaders.append("key", key);
    return (await fetch(urlApi + "/connect", {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })).json();
}
const info = async ({ key = "" }) => {
    const myHeaders = new Headers();
    myHeaders.append("key", key);
    return (await fetch(urlApi + "/info", {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })).json();
}
const getContacts = async ({ key = "" }) => {
    const myHeaders = new Headers();
    myHeaders.append("key", key);
    return (await fetch(urlApi + "/getContacts", {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })).json();
}
const getState = async ({ key = "" }) => {
    const myHeaders = new Headers();
    myHeaders.append("key", key);
    return (await fetch(urlApi + "/getState", {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })).json();
}
const getChats = async ({ key = "" }) => {
    const myHeaders = new Headers();
    myHeaders.append("key", key);
    return (await fetch(urlApi + "/getChats", {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    })).json();
}



export default {
    connect,
    info,
    getContacts,
    getState,
    getChats
}