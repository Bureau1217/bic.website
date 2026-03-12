<template>

    <div class="journal">
        <h2 class="list_title">{{ title }}</h2>
        <div class="journal_content">
            <div class="journal_content_wrapper">
                <p class="journal_text">{{ text }}</p>
                <NuxtLink :to="buttonUrl" class="journal_button">{{ buttonText }}</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
        default: 'Notre journal',
    },
    text: {
        type: String,
        required: true,
        default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    buttonText: {
        type: String,
        required: true,
    },
    buttonUrl: {
        type: String,
        default: '#',
    },
});
</script>

<style lang="scss" scoped>

.journal {
    width: 100%;
    padding: var(--40) 0 0;
}

.journal_content {
    width: 100%;
    padding: var(--40) var(--40);
    border-top: 1px solid var(--red);
    border-bottom: 1px solid var(--red);
}

.journal_content_wrapper {
    width: 60%;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: var(--20);
}

.journal_text {
   
}

.journal_button {
    font-size: 18px;
    font-weight: 500;
    color: var(--black);
    background-color: var(--yellow);
    padding: var(--10) var(--20);
    border-radius: 100px;
    text-decoration: none;
    font-style: normal;
    box-sizing: border-box;
    transition: background-color 0.3s ease;
}

.journal_button:hover {
    background-color: var(--green);
    color: var(--white);
}

@media screen and (max-width: 767px) {
    .journal_content_wrapper {
        width: 100%;
    }
}

@media screen and (max-width: 479px) {
    .journal_content {
        padding: var(--20) var(--10);
    }
}
</style>