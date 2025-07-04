import axios from 'axios';
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'

const router = useRouter()

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.withCredentials = true
const http = axios.create({
    baseURL: '/api',
    timeout: 3000
});

// 添加请求拦截器
http.interceptors.request.use(
    (config) => {
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers['Authorization'] = 'Bearer ' + userStore.token
        }
        return config;
    },
    (err) => {
        Promise.reject(err);
    }
);

http.interceptors.response.use(
    result => {
        if (result.config.responseType === 'blob') {
            return result;
        }

        if (result.data.code === 0) {
            return result.data
        }
        ElMessage.error(result.data.message ? result.data.message : '服务器错误');
        return Promise.reject(result.data);
    },
    err => {
        if (err.status === 401) {
            ElMessage.error('请登录');
            router.push('/login');
        }
        else {
            ElMessage.error('服务器错误');
        }
        return Promise.reject(err);
    }
)

export default http;