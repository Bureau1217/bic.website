<template>

    <div class="journal">
        <h2 class="list_title">{{ title }}</h2>
        <div class="journal_content">
            <div class="journal_content_wrapper">
                <p class="journal_text">{{ text }}</p>
                <div class="journal_buttons">
                    <a v-if="buttonText && buttonUrl" :href="buttonUrl" target="_blank" rel="noopener noreferrer" class="journal_button" download>{{ buttonText }}</a>
                    <NuxtLink v-if="button2Text && button2Url" :to="button2Url" class="journal_button">{{ button2Text }}</NuxtLink>
                </div>
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
        default: '',
    },
    buttonUrl: {
        type: String,
        default: '',
    },
    button2Text: {
        type: String,
        default: '',
    },
    button2Url: {
        type: String,
        default: '',
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

.journal_buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--10);
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