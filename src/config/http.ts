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

// 检查token状态
async function checkTokenStatus() {
    try {
        const userStore = useUserStore()
        if (!userStore.token) {
            return false
        }
        
        const response = await axios.get('/api/auth/token-status', {
            headers: {
                'Authorization': 'Bearer ' + userStore.token
            }
        })
        
        if (response.data.code === 0) {
            const data = response.data.data
            if (data.isValid) {
                // 更新用户信息
                userStore.userId = data.userId.toString()
                userStore.username = data.username
                userStore.role = data.role
                
                // 根据剩余时间动态调整检查频率
                const remainingSeconds = data.expirationSeconds
                
                if (remainingSeconds <= 60) {
                    // 如果剩余时间少于1分钟，每30秒检查一次
                    adjustTokenCheckInterval(30 * 1000)
                } else if (remainingSeconds <= 180) {
                    // 如果剩余时间少于3分钟，每1分钟检查一次
                    adjustTokenCheckInterval(60 * 1000)
                } else {
                    // 否则每2分钟检查一次
                    adjustTokenCheckInterval(2 * 60 * 1000)
                }
                
                return true
            } else {
                // token无效，清除用户信息
                userStore.$reset()
                ElMessage.error('登录已失效，请重新登录')
                // 延时跳转到登录页面
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        const userStore = useUserStore()
        userStore.$reset()
        ElMessage.error('登录已失效，请重新登录')
        // 延时跳转到登录页面
        setTimeout(() => {
            router.push('/login')
        }, 2000)
        return false
    }
}

// 定期检查token状态（每2分钟检查一次，因为token有效期为5分钟）
let tokenCheckInterval: number | null = null

function adjustTokenCheckInterval(intervalMs: number) {
    if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval)
    }
    tokenCheckInterval = setInterval(async () => {
        const userStore = useUserStore()
        if (userStore.token) {
            await checkTokenStatus()
        } else {
            stopTokenCheck()
        }
    }, intervalMs)
}

function startTokenCheck() {
    adjustTokenCheckInterval(2 * 60 * 1000) // 默认2分钟
}

function stopTokenCheck() {
    if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval)
        tokenCheckInterval = null
    }
}

// 导出token检查函数
export { checkTokenStatus, startTokenCheck, stopTokenCheck }

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
        if (err.response?.status === 401) {
            const userStore = useUserStore()
            userStore.$reset()
            ElMessage.error('登录已失效，请重新登录');
            // 延时跳转到登录页面
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
        else {
            ElMessage.error('服务器错误');
        }
        return Promise.reject(err);
    }
)

export default http;