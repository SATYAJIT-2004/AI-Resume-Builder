import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:'auth',
    initialState:{
        token:null,
        user:null,
        loading:true
    },
    reducers:{
        login:(state,actions)=>{
            state.token = actions.payload.token
            state.user = actions.payload.user
        },
        logout:(state)=>{
            state.token = '',
            state.user = null,
            localStorage.removeItem('token')
        },
        setLoading: (state,action)=>{
            state.loading = action.payload
        }
    }
})

export const {login,logout,setLoading} = authSlice.actions
export default authSlice.reducer