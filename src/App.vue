<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import * as NavBar from './components/NavBar.vue'  
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { checkTokenStatus, startTokenCheck } from './config/http'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <NavBar.default v-if="route.name !== 'Home' && route.name !== 'Login' && route.name !== 'Register'" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
